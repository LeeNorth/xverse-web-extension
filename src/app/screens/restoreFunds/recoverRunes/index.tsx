import ConfirmBitcoinTransaction from '@components/confirmBtcTransaction';
import RuneAmount from '@components/confirmBtcTransaction/itemRow/runeAmount';
import BottomTabBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useBtcFeeRate from '@hooks/useBtcFeeRate';
import useTransactionContext from '@hooks/useTransactionContext';
import { TransactionSummary } from '@screens/sendBtc/helpers';
import { RuneSummary, parseSummaryForRunes, runesTransaction } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Spinner from '@ui-library/spinner';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  ${(props) => props.theme.scrollbar}
  padding: 0 ${(props) => props.theme.space.xs};
`;

const Description = styled(StyledP)`
  text-align: left;
  margin: 0 ${(props) => props.theme.space.m} ${(props) => props.theme.space.l}
    ${(props) => props.theme.space.m};
`;

const RowContainer = styled.div((props) => ({
  marginBottom: `${props.theme.space.s}`,
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: `${props.theme.space.m} ${props.theme.space.s}`,
}));

const Container = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  marginTop: props.theme.space.xl,
}));

const LoaderContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const ButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.space.l,
  display: 'flex',
  alignItems: 'flex-end',
  padding: `0 ${props.theme.space.m}`,
}));

// TODO: export this from core
type EnhancedTransaction = Awaited<ReturnType<typeof runesTransaction.recoverRunes>>;

function RecoverRunes() {
  const { t } = useTranslation('translation', { keyPrefix: 'RECOVER_RUNES_SCREEN' });
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [enhancedTxn, setEnhancedTxn] = useState<EnhancedTransaction>();
  const [summary, setSummary] = useState<TransactionSummary>();
  const [runeSummary, setRuneSummary] = useState<RuneSummary>();
  const [isConfirmTx, setIsConfirmTx] = useState(false);

  const { data: btcFeeRates } = useBtcFeeRate();
  const context = useTransactionContext();

  const generateTransactionAndSummary = async (desiredFeeRate: number) => {
    const tx = await runesTransaction.recoverRunes(context, desiredFeeRate);
    const txSummary = await tx.getSummary();
    const txRuneSummary = await parseSummaryForRunes(context, txSummary, context.network);

    return { transaction: tx, summary: txSummary, runeSummary: txRuneSummary };
  };

  useEffect(() => {
    if (!btcFeeRates?.priority) return;

    if (!feeRate) {
      setFeeRate(btcFeeRates.priority.toString());
      return;
    }

    const buildTx = async () => {
      try {
        const txDetails = await generateTransactionAndSummary(+feeRate);
        setEnhancedTxn(txDetails.transaction);
        setSummary(txDetails.summary);
        setRuneSummary(txDetails.runeSummary);
      } catch (e) {
        setEnhancedTxn(undefined);
        setSummary(undefined);
        if (e instanceof Error) {
          if (e.message === 'No runes to recover') {
            setError(t('NO_RUNES'));
            return;
          }
          if (e.message.includes('Insufficient funds')) {
            setError(t('INSUFFICIENT_FUNDS'));
            return;
          }
        }
        setError((e as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    buildTx();
  }, [context, btcFeeRates, feeRate, t]);

  const calculateFeeForFeeRate = async (desiredFeeRate: number): Promise<number | undefined> => {
    const { summary: tempSummary } = await generateTransactionAndSummary(desiredFeeRate);
    if (tempSummary) return Number(tempSummary.fee);

    return undefined;
  };

  const handleToggleConfirmTx = () => setIsConfirmTx(!isConfirmTx);
  const handleOnNavigateBack = () => navigate(-1);

  const onClickTransfer = async () => {
    setIsBroadcasting(true);
    try {
      const txnId = await enhancedTxn?.broadcast();
      navigate('/tx-status', {
        state: {
          txid: txnId,
          currency: 'BTC',
          error: '',
        },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!error && !isLoading) {
    return !isConfirmTx ? (
      <>
        <TopRow title={t('TITLE')} onClick={handleOnNavigateBack} />
        <Description typography="body_m" color="white_200">
          {t('DESCRIPTION')}
        </Description>
        <ScrollContainer>
          {(runeSummary?.transfers ?? []).map((transfer) => (
            <RowContainer key={transfer.runeName}>
              <RuneAmount
                tokenName={transfer.runeName}
                amount={String(transfer.amount)}
                divisibility={transfer.divisibility}
                hasSufficientBalance={transfer.hasSufficientBalance}
              />
            </RowContainer>
          ))}
        </ScrollContainer>
        <ButtonContainer>
          <Button title={t('TRANSFER_ALL')} onClick={handleToggleConfirmTx} />
        </ButtonContainer>
        <BottomTabBar tab="settings" />
      </>
    ) : (
      <ConfirmBitcoinTransaction
        title={t('TITLE')}
        inputs={summary?.inputs ?? []}
        outputs={summary?.outputs ?? []}
        feeOutput={summary?.feeOutput}
        showCenotaphCallout={!!summary?.runeOp?.Cenotaph?.flaws}
        runeSummary={runeSummary}
        isLoading={isLoading}
        isSubmitting={isBroadcasting}
        confirmText={t('CONFIRM')}
        cancelText={t('BACK')}
        onCancel={handleToggleConfirmTx}
        onConfirm={onClickTransfer}
        getFeeForFeeRate={calculateFeeForFeeRate}
        onFeeRateSet={(newFeeRate) => setFeeRate(newFeeRate.toString())}
        feeRate={+feeRate}
        isError={!!error}
        hideBottomBar={false}
        selectedBottomTab="settings"
        showAccountHeader={false}
        isBroadcast
        onBackClick={handleToggleConfirmTx}
      />
    );
  }
  return (
    <>
      <TopRow title={t('TITLE')} onClick={handleOnNavigateBack} />
      <Container>
        {isLoading ? (
          <LoaderContainer>
            <Spinner color="white" size={25} />
          </LoaderContainer>
        ) : (
          <Description typography="body_l" color="white_200">
            {error}
          </Description>
        )}
      </Container>
      {!isLoading && (
        <ButtonContainer>
          <Button title={t('BACK')} onClick={handleOnNavigateBack} />
        </ButtonContainer>
      )}
      <BottomTabBar tab="settings" />
    </>
  );
}

export default RecoverRunes;
