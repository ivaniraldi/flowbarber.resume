export type PaymentMethod = 'dinheiro' | 'pagamento online';

export type Service = {
  id: string;
  name: string;
  price: number;
  paymentMethod: PaymentMethod;
  date: string; // Stored as 'yyyy-MM-dd'
};

export type PredefinedService = {
  name: string;
  price: number;
};

export type ClientPlan = {
  id: string;
  name: string;
  price: number;
  totalCuts: number;
  remainingCuts: number;
};
