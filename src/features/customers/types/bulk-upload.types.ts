// shared/ui/bulk-upload/types.ts

export interface ColumnMapping {
  csvColumn: string; // column from the uploaded file
  targetField: string; // field your API expects
}

export interface TargetField {
  key: string; // e.g. "firstName"
  label: string; // e.g. "First Name"
  required?: boolean;
}
