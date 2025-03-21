import React from 'react';
import { Button, Spinner, ButtonProps } from 'reactstrap';

interface LoadingButtonProps extends Omit<ButtonProps, 'ref'> {
  /**
   * Whether the button is in loading state
   */
  isLoading?: boolean;
  /**
   * Text to display when button is in loading state
   */
  loadingText?: string;
  /**
   * Default text to display when button is not in loading state
   */
  defaultText?: string;
  /**
   * Additional CSS class for the spinner
   */
  spinnerClassName?: string;
  /**
   * Size of the spinner
   */
  spinnerSize?: string;
  /**
   * Position of the spinner relative to the text
   * 'start' - spinner appears before the text
   * 'end' - spinner appears after the text
   */
  spinnerPosition?: 'start' | 'end';
}

/**
 * LoadingButton component that shows a spinner when in loading state
 */
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
    // If disabled is passed along with isLoading, we don't need to set disabled twice
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
      <Button {...rest} disabled={isDisabled} innerRef={ref}>
        {renderContent()}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
