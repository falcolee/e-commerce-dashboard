export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: ValidationError[];
}
