import { ButtonProps } from 'reactstrap';

export interface LoadingButtonProps extends Omit<ButtonProps, 'ref'> {
  isLoading?: boolean;

  loadingText?: string;

  defaultText?: string;

  spinnerClassName?: string;

  spinnerSize?: string;

  spinnerPosition?: 'start' | 'end';
}
