export interface CustomApiError {
  message: string;
  rationale: string;
}

export class BusinessLogicError extends Error {
  constructor(
    public rationale: CustomApiError['rationale'],
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}
