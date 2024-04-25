import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import styled from 'styled-components';

import copyIcon from '@assets/img/Copy.svg';

const StyledToolTip = styled(Tooltip)`
  background-color: #ffffff;
  color: #12151e;
  border-radius: 8px;
  padding: 7px;
`;

const AddressComponent = styled.p({
  width: '100%',
});

const AddressComponentTitle = styled.p((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(2),
}));

const AddressComponentContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
});

const AddressCompononentText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  maxWidth: '300px',
  wordBreak: 'break-all',
}));

const CopyButton = styled.button`
  color: #ffffff;
  display: flex;
  flexdirection: row;
  alignitems: center;
  justifycontent: center;
  background: transparent;
  :hover {
    opacity: 1;
  }
  :focus {
    opacity: 1;
  }
`;

const CopyImage = styled.img((props) => ({
  marginLeft: props.theme.spacing(2),
}));

interface Props {
  title: string;
  address?: string;
}

function LedgerAddressComponent({ title, address }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = () => {
    if (!address) {
      return;
    }
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return address ? (
    <AddressComponent>
      <AddressComponentTitle>{title}</AddressComponentTitle>
      <AddressComponentContainer>
        <AddressCompononentText>{address}</AddressCompononentText>
        <CopyButton id={`${title}_anchor`} onClick={handleClick}>
          <CopyImage src={copyIcon} alt="copy" />
        </CopyButton>
        <StyledToolTip
          anchorId={`${title}_anchor`}
          variant="light"
          content={isCopied ? 'Copied' : title}
          events={['hover']}
          place="bottom"
          hidden={!isCopied}
        />
      </AddressComponentContainer>
    </AddressComponent>
  ) : null;
}

export default LedgerAddressComponent;
