export interface CommonFormItemProps {
  label?: string;
  name: string;
  is: string; // 'el-input', 'el-select', 'el-button', etc.
  show?: boolean | ((formState: any) => boolean);
  default?: any;
  options?: Array<{ label: string; value: any }>;
  rules?: any[];
  [key: string]: any; // For other el-component props
}

export interface CommonFormButtonProps extends CommonFormItemProps {
  action?: 'validate' | 'reset';
  onClick?: (formState?: any) => void;
}

export interface CommonTableColumnProps {
  label: string;
  prop: string;
  width?: string | number;
  fixed?: boolean | 'left' | 'right';
  type?: 'selection' | 'index' | 'expand';
  slots?: {
    customRender?: string; // slot name
    customConfig?: any;
  };
  [key: string]: any;
}

export interface TableCustomButton {
  label: string;
  value: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'large' | 'default' | 'small';
  [key: string]: any;
}
