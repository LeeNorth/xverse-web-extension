import classNames from 'classnames';
import styled from 'styled-components';
import Spinner from './spinner';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

const StyledButton = styled.button`
  width: 100%;
  user-select: none;
  transition: all 0.1s ease;
  min-height: 44px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${(props) => props.theme.space.xs};

  padding: ${(props) => props.theme.space.s} ${(props) => props.theme.space.m};
  border-radius: 12px;

  ${(props) => props.theme.typography.body_medium_m}

  cursor: pointer;
  &:disabled {
    cursor: not-allowed;
  }

  &.primary {
    background-color: ${(props) => props.theme.colors.white_0};
    border: 1px solid;
    color: ${(props) => props.theme.colors.elevation0};

    :focus-visible,
    :hover:enabled {
      background-color: ${(props) => props.theme.colors.white_200};
    }
    :active:enabled {
      background-color: ${(props) => props.theme.colors.white_400};
    }
    :disabled {
      background-color: ${(props) => props.theme.colors.white_600};
    }
  }

  &.secondary {
    background-color: transparent;
    border: 1px solid ${(props) => props.theme.colors.white_800};
    color: ${(props) => props.theme.colors.white_0};

    :focus-visible,
    :hover:enabled {
      background-color: ${(props) => props.theme.colors.elevation6_800};
      border: 1px solid ${(props) => props.theme.colors.white_850};
      color: ${(props) => props.theme.colors.white_0};
    }
    :active:enabled {
      background-color: ${(props) => props.theme.colors.elevation6_600};
      border: 1px solid ${(props) => props.theme.colors.white_800};
      color: ${(props) => props.theme.colors.white_0};
    }
    :disabled {
      border: 1px solid ${(props) => props.theme.colors.white_900};
      color: ${(props) => props.theme.colors.white_400};
    }
  }

  &.tertiary {
    background-color: transparent;
    border: none;
    color: ${(props) => props.theme.colors.white_0};

    :focus-visible,
    :hover:enabled {
      color: ${(props) => props.theme.colors.white_200};
    }
    :active:enabled {
      color: ${(props) => props.theme.colors.white_400};
    }
    :disabled {
      color: ${(props) => props.theme.colors.white_600};
    }
  }

  &.danger {
    background-color: ${(props) => props.theme.colors.danger_dark};
    border: none;
    color: ${(props) => props.theme.colors.white_0};

    :focus-visible,
    :hover:enabled {
      background-color: ${(props) => props.theme.colors.danger_dark_100};
      color: ${(props) => props.theme.colors.white_0};
    }
    :active:enabled {
      background-color: ${(props) => props.theme.colors.danger_dark_200};
      color: ${(props) => props.theme.colors.white_0};
    }
    :disabled {
      background-color: ${(props) => props.theme.colors.danger_dark_400};
      color: ${(props) => props.theme.colors.white_400};
    }
  }
`;

const CenterDiv = styled.div`
  display: flex;
  align-content: center;
`;

type Props = {
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
};

function Button({
  title,
  onClick,
  icon,
  className,
  loading = false,
  disabled = false,
  variant = 'primary',
  type,
}: Props) {
  return (
    <StyledButton
      className={classNames(className, variant)}
      onClick={onClick}
      tabIndex={0}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          {icon && <CenterDiv>{icon}</CenterDiv>}
          <div>{title}</div>
        </>
      )}
    </StyledButton>
  );
}

export default Button;
