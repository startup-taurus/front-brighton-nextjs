export interface FiltersProps {
  labelName: string;
  name: string;
  type?: "text" | "select";
  items?: { label: string; value: string | number }[];
  placeholder?: string;
}
