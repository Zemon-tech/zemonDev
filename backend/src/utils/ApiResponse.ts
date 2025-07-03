/**
 * ApiResponse Class
 * 
 * Standardizes API responses across the application.
 */
class ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;

  constructor(statusCode: number, message: string = "Success", data: T | null = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

export default ApiResponse; 