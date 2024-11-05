export class BackendError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 0,
    public readonly errors: string[] = []
  ) {
    super(message);
    this.name = 'BackendError';
    this.errors = errors ?? {};
    this.statusCode = statusCode ?? 0;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface IBackendErrorResponseDto {
  statusCode: number;
  message: string;
  errors: string[];
  additionalInfo: { [key: string]: string[] };
}

export class BackendErrorResponse {
  constructor(public readonly statusCode: number, public readonly errors: string[], public readonly message?: string) {
    this.statusCode = statusCode;
    this.errors = errors;
    if (message) {
      this.message = message;
    } else {
      this.message = this.flattenErrors(" \n");
    }
  }

  hasError(errorKey: string): boolean {
    return errorKey in this.errors;
  }

  flattenErrors(separator?: string, defaultValue?: string): string {
    if (this.errors.length == 0 && defaultValue) {
      return defaultValue;
    }

    return this.errors.join(separator);
  }

  getFirstError(defaultValue?: string): string {
    if (this.errors.length == 0 && defaultValue) {
      return defaultValue;
    }

    return this.errors[0];
  }
}
