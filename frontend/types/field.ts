interface BaseField {
  type: string;
  tag: string;
  label: string;
  help_text: string | null;
  required: boolean;
}

export interface TextField extends BaseField {
  type: "text";
  min_length: number;
  max_length: number;
}

export interface ParagraphField extends BaseField {
  type: "paragraph";
  min_length: number;
  max_length: number;
}

export interface SelectField extends BaseField {
  type: "select";
  options: string[];
}

export interface DropdownField extends BaseField {
  type: "dropdown";
  options: string[];
}

export interface MultiSelectField extends BaseField {
  type: "multi_select";
  options: string[];
}

export interface DateField extends BaseField {
  type: "date";
  min_date: string;
  max_date: string;
}

export interface EmailField extends BaseField {
  type: "email";
}

export interface NumberField extends BaseField {
  type: "number";
  min_value: number;
  max_value: number;
  precision: number;
}

export interface UrlField extends BaseField {
  type: "url";
}

export type Field =
  | TextField
  | ParagraphField
  | SelectField
  | DropdownField
  | MultiSelectField
  | DateField
  | EmailField
  | NumberField
  | UrlField;
