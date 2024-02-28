import useWalletSelector from '@hooks/useWalletSelector';
import { validateBtcAddress } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

type Props = {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  onNext: () => void;
  isLoading: boolean;
  header?: React.ReactNode;
};

// TODO: this could be extracted into a component for reuse
function RecipientSelector({
  recipientAddress,
  setRecipientAddress,
  onNext,
  isLoading,
  header,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { network } = useWalletSelector();
  const [addressIsValid, setAddressIsValid] = useState(true);

  const handleNext = () => {
    if (validateBtcAddress({ btcAddress: recipientAddress, network: network.type })) {
      onNext();
    } else {
      setAddressIsValid(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
    setAddressIsValid(true);
  };

  const inputFeedback = useMemo(() => {
    if (addressIsValid) {
      return [];
    }
    return [
      {
        variant: 'danger' as const,
        message: t('ERRORS.ADDRESS_INVALID'),
      },
    ];
  }, [addressIsValid]);

  return (
    <Container>
      <div>
        {header}
        <Input
          title={t('RECIPIENT')}
          placeholder={t('BTC.RECIPIENT_PLACEHOLDER')}
          value={recipientAddress}
          onChange={handleAddressChange}
          variant={addressIsValid ? 'default' : 'danger'}
          feedback={inputFeedback}
        />
      </div>
      <Buttons>
        <Button
          title={t('NEXT')}
          onClick={handleNext}
          disabled={!recipientAddress || !addressIsValid}
          loading={isLoading}
        />
      </Buttons>
    </Container>
  );
}

export default RecipientSelector;
