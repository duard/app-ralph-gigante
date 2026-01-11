/**
 * Base component props
 */
export interface BaseComponentProps {
  className?: string;
  id?: string;
}

/**
 * Loading state props
 */
export interface LoadingProps {
  isLoading: boolean;
  loadingText?: string;
}

/**
 * Error state props
 */
export interface ErrorProps {
  error: Error | string;
  onRetry?: () => void;
}

/**
 * Empty state props
 */
export interface EmptyProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  id: string;
  header: string;
  accessorKey?: keyof T | ((row: T) => any);
  cell?: (props: { row: T }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
}

/**
 * Table action definition
 */
export interface TableAction<T = any> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: (row: T) => boolean;
}

/**
 * Modal props
 */
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Form field props
 */
export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}
