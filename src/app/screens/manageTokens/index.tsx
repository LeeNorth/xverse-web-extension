import stacksIcon from '@assets/img/dashboard/stx_icon.svg';
import runesComingSoon from '@assets/img/manageTokens/runes_coming_soon.svg';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import { useGetBrc20FungibleTokens } from '@hooks/queries/ordinals/useGetBrc20FungibleTokens';
import { useGetRuneFungibleTokens } from '@hooks/queries/runes/useGetRuneFungibleTokens';
import { useGetSip10FungibleTokens } from '@hooks/queries/stx/useGetSip10FungibleTokens';
import useHasFeature from '@hooks/useHasFeature';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import CoinItem from '@screens/manageTokens/coinItem';
import { FungibleToken, FungibleTokenProtocol } from '@secretkeylabs/xverse-core';
import {
  setBrc20ManageTokensAction,
  setRunesManageTokensAction,
  setSip10ManageTokensAction,
} from '@stores/wallet/actions/actionCreators';
import BigNumber from 'bignumber.js';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const TokenContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }

  margin-bottom: ${(props) => props.theme.space.xl};
  > *:not(:last-child) {
    border-bottom: 1px solid ${(props) => props.theme.colors.elevation3};
  }
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  paddingLeft: 16,
  paddingRight: 16,
  height: '100%',
});

const ScrollableContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const FtInfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginBottom: props.theme.spacing(8),
}));

const Button = styled.button<{
  isSelected: boolean;
}>((props) => ({
  ...props.theme.typography.body_bold_l,
  fontSize: 12,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 31,
  paddingLeft: props.theme.spacing(6),
  paddingRight: props.theme.spacing(6),
  marginRight: props.theme.spacing(2),
  borderRadius: 44,
  background: props.isSelected ? props.theme.colors.elevation3 : 'transparent',
  color: props.theme.colors.white_0,
  opacity: props.isSelected ? 1 : 0.6,
  userSelect: 'none',
}));

const Header = styled.h1((props) => ({
  ...props.theme.typography.headline_xs,
  marginBottom: props.theme.spacing(8),
}));

const Description = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(16),
}));

const RunesContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  marginRight: props.theme.spacing(5),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
}));

const ErrorsText = styled.p((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(16),
  marginBottom: 'auto',
  textAlign: 'center',
}));

const RunesComingSoon = styled.img({
  width: '70%',
});

function Stacks() {
  const { hideStx } = useWalletSelector();
  const { toggleStxVisibility } = useWalletReducer();
  const tickerConstant = 'STX';
  return (
    <CoinItem
      id={tickerConstant}
      key={tickerConstant}
      name="Stacks"
      ticker={tickerConstant}
      image={stacksIcon}
      disabled={false}
      toggled={toggleStxVisibility}
      enabled={!hideStx}
    />
  );
}

function ManageTokens() {
  const { t } = useTranslation('translation', { keyPrefix: 'TOKEN_SCREEN' });

  const { sip10ManageTokens, brc20ManageTokens, runesManageTokens, selectedAccount } =
    useWalletSelector();
  const { data: runesList, isError: runeError } = useGetRuneFungibleTokens();
  const { data: sip10List, isError: sip10Error } = useGetSip10FungibleTokens();
  const { data: brc20List, isError: brc20Error } = useGetBrc20FungibleTokens();

  const [selectedProtocol, setSelectedProtocol] = useState<FungibleTokenProtocol>(
    selectedAccount?.stxAddress ? 'stacks' : 'brc-20',
  );
  const showRunes = useHasFeature('RUNES_SUPPORT');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggled = (isEnabled: boolean, _coinName: string, coinKey: string) => {
    const runeFt = runesList?.find((ft) => ft.principal === coinKey);
    const sip10Ft = sip10List?.find((ft) => ft.principal === coinKey);
    const brc20Ft = brc20List?.find((ft) => ft.principal === coinKey);

    if (selectedProtocol === 'runes' && runeFt) {
      dispatch(setRunesManageTokensAction({ principal: coinKey, isEnabled }));
    } else if (selectedProtocol === 'stacks' && sip10Ft) {
      dispatch(setSip10ManageTokensAction({ principal: coinKey, isEnabled }));
    } else if (selectedProtocol === 'brc-20' && brc20Ft) {
      dispatch(setBrc20ManageTokensAction({ principal: coinKey, isEnabled }));
    }
  };

  const handleBackButtonClick = () => navigate('/');

  const getCoinsList = () => {
    let coins: FungibleToken[];
    let error: boolean;
    switch (selectedProtocol) {
      case 'stacks':
        coins = (sip10List ?? []).map((ft) => ({
          ...ft,
          visible: sip10ManageTokens[ft.principal] ?? new BigNumber(ft.balance).gt(0),
        }));
        error = sip10Error;
        break;
      case 'brc-20':
        coins = (brc20List ?? []).map((ft) => ({
          ...ft,
          visible: brc20ManageTokens[ft.principal] ?? new BigNumber(ft.balance).gt(0),
        }));
        error = brc20Error;
        break;
      case 'runes':
        coins = (runesList ?? []).map((ft) => ({
          ...ft,
          visible: runesManageTokens[ft.principal] ?? new BigNumber(ft.balance).gt(0),
        }));
        error = runeError;
        break;
      default:
        coins = [];
        error = false;
    }

    if (error) return <ErrorsText>{t('FAILED_TO_FETCH')}</ErrorsText>;
    return (
      <>
        {selectedProtocol === 'stacks' && <Stacks />}
        {coins.map((coin: FungibleToken) => (
          <CoinItem
            id={coin.principal}
            key={coin.principal}
            name={coin.name}
            image={coin.image}
            ticker={coin.ticker}
            runeInscriptionId={coin.runeInscriptionId}
            runeSymbol={coin.runeSymbol}
            disabled={false}
            toggled={toggled}
            enabled={coin.visible}
          />
        ))}
        {!coins.length && <ErrorsText>{t('NO_COINS')}</ErrorsText>}
      </>
    );
  };

  return (
    <>
      <TopRow onClick={handleBackButtonClick} />
      <Container>
        <ScrollableContainer>
          <Header>{t('ADD_COINS')}</Header>
          <Description>{t('DESCRIPTION')}</Description>
          <FtInfoContainer>
            {selectedAccount?.stxAddress && (
              <Button
                isSelected={selectedProtocol === 'stacks'}
                onClick={() => setSelectedProtocol('stacks')}
              >
                SIP-10
              </Button>
            )}
            <Button
              isSelected={selectedProtocol === 'brc-20'}
              onClick={() => setSelectedProtocol('brc-20')}
            >
              BRC-20
            </Button>
            <Button
              isSelected={selectedProtocol === 'runes'}
              onClick={() => setSelectedProtocol('runes')}
            >
              RUNES
            </Button>
          </FtInfoContainer>
          <TokenContainer>
            {selectedProtocol === 'runes' && !showRunes ? (
              <RunesContainer>
                <RunesComingSoon src={runesComingSoon} />
              </RunesContainer>
            ) : (
              getCoinsList()
            )}
          </TokenContainer>
        </ScrollableContainer>
      </Container>
      <BottomBar tab="dashboard" />
    </>
  );
}

export default ManageTokens;
