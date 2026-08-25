export interface RawMLInput {
  amount: number;
  historicalAverageAmount: number;
  amountRatio: number;
  transactionsLast5Min: number;
  transactionsLast1Hour: number;
  dailyTransactionAverage: number;
  newDevice: number; // 0 or 1
  locationChanged: number; // 0 or 1
  failedTransactions: number;
  accountAgeDays: number;
  merchantCategory: string;
  paymentMethod: string;
  merchantRiskLevel: number; // 0, 1, 2
  hourOfDay: number; // 0 - 23
  deviceAgeDays: number;
}

export interface MLFeatureVector {
  vector: number[];
  featureMap: Record<string, number | string>;
  featureNames: string[];
}

export interface SyntheticDataSample {
  features: number[];
  isRisky: 0 | 1;
  metadata: {
    scenario: string;
    amount: number;
    amountRatio: number;
    merchantCategory: string;
  };
}
