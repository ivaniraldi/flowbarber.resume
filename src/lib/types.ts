export type PaymentMethod = 'efectivo' | 'pagamento online';

export type Service = {
  id: string;
  name: string;
  price: number;
  paymentMethod: PaymentMethod;
};

export type PredefinedService = {
  name: string;
  price: number;
};
