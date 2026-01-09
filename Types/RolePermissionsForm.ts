export interface RolePermissionsFormProps {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  data?: { role_name: string; status: string; permissions: string[] } | null;
  readOnly?: boolean;
}