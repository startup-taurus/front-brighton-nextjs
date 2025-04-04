export interface FiltersProps {
  labelName: string;
  name: string;
  type?: string;
  items?: any[];
  placeholder?: string;
  asyncComponent?: (props: any) => JSX.Element;
  onInputChange?: (inputValue: string) => void;
  onMenuScrollToBottom?: () => void;
}
