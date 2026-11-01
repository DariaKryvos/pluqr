export class ShopifyError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ShopifyError';
    this.code = code;
    this.status = status;
  }
}
