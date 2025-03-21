import React from 'react';
import { Button, Spinner, ButtonProps } from 'reactstrap';

interface LoadingButtonProps extends Omit<ButtonProps, 'ref'> {
  isLoading?: boolean;

  loadingText?: string;

  defaultText?: string;

  spinnerClassName?: string;

  spinnerSize?: string;

  spinnerPosition?: 'start' | 'end';
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      isLoading = false,
      loadingText,
      defaultText,
      spinnerClassName = 'me-2',
      spinnerSize = 'sm',
      spinnerPosition = 'start',
      disabled,
      children,
      ...rest
    },
    ref
  ) => {
    const isDisabled = isLoading || disabled;

    const renderContent = () => {
      if (!isLoading) {
        return defaultText || children;
      }

      const spinnerElement = (
        <Spinner
          size={spinnerSize}
          className={spinnerPosition === 'start' ? spinnerClassName : 'ms-2'}
        />
      );

      return (
        <>
          {spinnerPosition === 'start' && spinnerElement}
          {loadingText || children}
          {spinnerPosition === 'end' && spinnerElement}
        </>
      );
    };

    return (
      <Button
        {...rest}
        disabled={isDisabled}
        innerRef={ref}
      >
        {renderContent()}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
