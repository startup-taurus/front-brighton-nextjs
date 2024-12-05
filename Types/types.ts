export interface FiltersProps {
  labelName: string;
  name: string;
  items: { label: string; value: string | number }[];
  onChange: (event: any) => void;
  value: string;
}
