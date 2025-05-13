export interface FiltersProps {
  labelName: string;
  name: string;
  type?: string;
  items?: any[];
  placeholder?: string;
  asyncComponent?: (props: any) => JSX.Element;
  onInputChange?: (inputValue: string) => void;
  onMenuScrollToBottom?: () => void;
  isAsync?: boolean;
  value?:
    | string
    | string[]
    | { value: string | number | string[]; label: string }
    | null;
  inputValue?: string;
  onChange?: (selectedOption: { value: string; label: string } | null) => void;
  isLoading?: boolean;
}
