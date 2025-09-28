export type PaymentMethod = 'dinheiro' | 'pagamento online';

export type Service = {
  id: string;
  name: string;
  price: number;
  paymentMethod: PaymentMethod;
  date: string;
};

export type PredefinedService = {
  name: string;
  price: number;
};
