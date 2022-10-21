import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { NumericFormat } from 'react-number-format';
import { ReactNode, useState } from 'react';
import BigNumber from 'bignumber.js';
import { microStxToStx } from '@utils/helper';
import { currencySymbolMap } from '@secretkeylabs/xverse-core/types/currency';
import ActionButton from '@components/button';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import Theme from 'theme';
import { getBtcFiatEquivalent, getStxFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core/currency';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(6),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(6),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const FeeText = styled.h1((props) => ({
  ...props.theme.body_m,
}));

const FeeTitleContainer = styled.div({
  display: 'flex',
  flex: 1,
});

const FeeContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

const SendAmountContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const AmountText = styled.h1((props) => ({
  ...props.theme.headline_category_m,
  fontSize: 28,
}));

const FiatAmountText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
}));

interface Props {
  fee: BigNumber;
  currency: 'BTC' | 'STX';
  children: ReactNode;
  onConfirmClick: () => void;
  onCancelClick: () => void;
}

function ConfirmTransation({
  fee, currency, children, onConfirmClick, onCancelClick,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [openTransactionSettingModal, setOpenTransactionSettingModal] = useState(false);
  const navigate = useNavigate();
  const amount = 1000;
  const stxBtcRate = new BigNumber(0.00001686);
  const btcFiatRate = new BigNumber(18935.735);
  const fiatCurrency = 'USD';

  const handleBackButtonClick = () => {
    navigate('/');
  };
  const getFiatAmountString = (fiatAmount: BigNumber) => {
    if (fiatAmount) {
      if (fiatAmount.isLessThan(0.01)) {
        return `<${currencySymbolMap[fiatCurrency]}0.01 ${fiatCurrency}`;
      }
      return (
        <NumericFormat
          value={fiatAmount.toFixed(2).toString()}
          displayType="text"
          thousandSeparator
          prefix={`${currencySymbolMap[fiatCurrency]} `}
          suffix={` ${fiatCurrency}`}
          renderText={(value: string) => <FiatAmountText>{value}</FiatAmountText>}
        />
      );
    }
    return '';
  };

  function getFiatEquivalent() {
    if (currency === 'STX') {
      return getStxFiatEquivalent(new BigNumber(fee), stxBtcRate, btcFiatRate);
    } if (currency === 'BTC') {
      return getBtcFiatEquivalent(new BigNumber(fee), btcFiatRate);
    }
    return new BigNumber(0);
  }

  function renderFee() {
    if (currency === 'STX') {
      return `${microStxToStx(fee)} ${currency}`;
    } if (currency === 'BTC') {
      return `${satsToBtc(fee)} ${currency}`;
    }
  }

  const onAdvancedSettingClick = () => {
    setOpenTransactionSettingModal(true);
  };

  const closeTransactionSettingAlert = () => {
    setOpenTransactionSettingModal(false);
  };

  return (
    <>
      <TopRow title={t('SEND')} onClick={handleBackButtonClick} />
      <Container>
        <SendAmountContainer>
          <TitleText>{t('INDICATION')}</TitleText>
          <AmountText>
            {amount}
            {' '}
            {currency}
          </AmountText>
        </SendAmountContainer>
        {children}
        <RowContainer>
          <FeeTitleContainer>
            <TitleText>{t('FEES')}</TitleText>
          </FeeTitleContainer>
          <FeeContainer>
            <FeeText>{renderFee()}</FeeText>
            <FiatAmountText>{getFiatAmountString(getFiatEquivalent())}</FiatAmountText>
          </FeeContainer>
        </RowContainer>
        <ActionButton
          src={SettingIcon}
          text={currency === 'STX' ? t('ADVANCED_SETTING') : t('EDIT_FEES')}
          buttonColor="transparent"
          buttonAlignment="flex-start"
          onPress={onAdvancedSettingClick}
        />
        <TransactionSettingAlert
          visible={openTransactionSettingModal}
          fee="102"
          type={currency}
          onApplyClick={closeTransactionSettingAlert}
          onCrossClick={closeTransactionSettingAlert}
        />
      </Container>
      <ButtonContainer>
        <ActionButton
          text={t('CANCEL')}
          buttonColor="transparent"
          buttonBorderColor={Theme.colors.background.elevation2}
          onPress={onCancelClick}
          margin={3}
        />
        <ActionButton text={t('CONFIRM')} onPress={onConfirmClick} />
      </ButtonContainer>
    </>
  );
}

export default ConfirmTransation;
