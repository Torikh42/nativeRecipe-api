export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";

    // Ini memastikan prototype chain bekerja dengan benar
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
