import { Transaction, UserProfile } from '../../../shared/types';
import { MLFeatureVector } from './types';

export const ML_FEATURE_NAMES = [
  'amount',
  'historicalAverageAmount',
  'amountRatio',
  'transactionsLast5Min',
  'transactionsLast1Hour',
  'dailyTransactionAverage',
  'newDevice',
  'locationChanged',
  'failedTransactions',
  'accountAgeDays',
  'merchantCategoryCode',
  'paymentMethodCode',
  'merchantRiskLevel',
  'hourOfDay',
  'deviceAgeDays',
] as const;

export const FEATURE_DISPLAY_NAMES: Record<string, string> = {
  amount: 'Transaction Amount (INR)',
  historicalAverageAmount: 'Historical Average Baseline',
  amountRatio: 'Amount Ratio Multiplier',
  transactionsLast5Min: '5-Minute Velocity Count',
  transactionsLast1Hour: '1-Hour Velocity Count',
  dailyTransactionAverage: 'Average Daily Frequency',
  newDevice: 'Unrecognized Device Flag',
  locationChanged: 'Geolocation Deviation Flag',
  failedTransactions: 'Recent Failed Retries',
  accountAgeDays: 'Account Longevity (Days)',
  merchantCategoryCode: 'Merchant Industry Sector',
  paymentMethodCode: 'Payment Rail Channel',
  merchantRiskLevel: 'Merchant Risk Classification',
  hourOfDay: 'Transaction Time of Day',
  deviceAgeDays: 'Hardware Fingerprint Longevity',
};

export const MERCHANT_CATEGORY_MAP: Record<string, number> = {
  'Supermarkets': 0,
  'General Supermarkets': 0,
  'Food & Beverage': 1,
  'Dining & Restaurants': 1,
  'Utilities': 2,
  'Utilities & Bill Pay': 2,
  'Books & Education': 3,
  'Retail Goods': 4,
  'Clothing & Apparel': 4,
  'Home Decor': 5,
  'Automotive & Fuel': 5,
  'Transportation': 5,
  'Travel & Airlines': 6,
  'Luxury Retail': 7,
  'Gaming': 8,
  'Digital Goods & Vouchers': 9,
  'Electronics & High-Risk Goods': 10,
  'Precious Metals': 11,
  'Cryptocurrency Exchange': 12,
};

export const PAYMENT_METHOD_MAP: Record<string, number> = {
  'UPI': 0,
  'CREDIT_CARD': 1,
  'Credit Card': 1,
  'DEBIT_CARD': 2,
  'Debit Card': 2,
  'NET_BANKING': 3,
  'Net Banking': 3,
  'WALLET': 4,
  'Wallet': 4,
};

export class FeatureExtractor {
  public static getMerchantRiskLevel(category: string): number {
    const highRisk = [
      'Cryptocurrency Exchange',
      'Precious Metals',
      'Electronics & High-Risk Goods',
      'Digital Goods & Vouchers',
      'Gaming',
    ];
    const mediumRisk = ['Luxury Retail', 'Travel & Airlines'];
    if (highRisk.some((h) => category.toLowerCase().includes(h.toLowerCase()))) return 2;
    if (mediumRisk.some((m) => category.toLowerCase().includes(m.toLowerCase()))) return 1;
    return 0;
  }

  public static extractFeatures(
    tx: Transaction,
    user: UserProfile | null,
    userHistory: Transaction[] = []
  ): MLFeatureVector {
    const amount = typeof tx.amount === 'number' && !isNaN(tx.amount) ? tx.amount : 1000;
    const historicalAverage =
      user?.historicalAverageAmount && user.historicalAverageAmount > 0
        ? user.historicalAverageAmount
        : 5000;

    const amountRatio = Number((amount / historicalAverage).toFixed(2));

    // Velocity extraction from recent history
    const txTime = new Date(tx.timestamp || Date.now()).getTime();
    const fiveMinutesAgo = txTime - 5 * 60 * 1000;
    const oneHourAgo = txTime - 60 * 60 * 1000;

    let txCount5m = 1;
    let txCount1h = 1;

    for (const h of userHistory) {
      if (h.id === tx.id) continue;
      const hTime = new Date(h.timestamp).getTime();
      if (hTime >= fiveMinutesAgo && hTime <= txTime + 60000) txCount5m++;
      if (hTime >= oneHourAgo && hTime <= txTime + 60000) txCount1h++;
    }

    const totalTxCount = user?.totalTransactionsCount || 10;
    const accountAge = user?.accountAgeDays || 180;
    const dailyTxAvg = Number((totalTxCount / Math.max(1, accountAge)).toFixed(2));

    // Device analysis
    let isNewDevice = 0;
    if (user?.knownDevices && user.knownDevices.length > 0) {
      isNewDevice = user.knownDevices.includes(tx.deviceId) ? 0 : 1;
    } else if (tx.deviceId && tx.deviceId.includes('UNKNOWN')) {
      isNewDevice = 1;
    }

    // Location analysis
    let isLocationChanged = 0;
    if (user?.knownLocations && user.knownLocations.length > 0) {
      const match = user.knownLocations.some((loc) =>
        tx.location.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(tx.location.toLowerCase())
      );
      isLocationChanged = match ? 0 : 1;
    } else if (user?.usualLocation) {
      isLocationChanged = tx.location.toLowerCase().includes(user.usualLocation.toLowerCase()) ? 0 : 1;
    }

    const failedTxCount = user?.failedTransactionsCountLast30Days ?? 0;
    const merchantCategoryCode = MERCHANT_CATEGORY_MAP[tx.merchantCategory] ?? 4;
    const paymentMethodCode = PAYMENT_METHOD_MAP[tx.paymentMethod] ?? 0;
    const merchantRiskLevel = this.getMerchantRiskLevel(tx.merchantCategory || '');
    
    const txDate = new Date(tx.timestamp || Date.now());
    const hourOfDay = isNaN(txDate.getUTCHours()) ? 12 : txDate.getUTCHours();
    const deviceAgeDays = isNewDevice ? 0 : Math.min(accountAge, 180);

    const vector: number[] = [
      amount,
      historicalAverage,
      amountRatio,
      txCount5m,
      txCount1h,
      dailyTxAvg,
      isNewDevice,
      isLocationChanged,
      failedTxCount,
      accountAge,
      merchantCategoryCode,
      paymentMethodCode,
      merchantRiskLevel,
      hourOfDay,
      deviceAgeDays,
    ];

    const featureMap: Record<string, number | string> = {
      amount,
      historicalAverageAmount: historicalAverage,
      amountRatio,
      transactionsLast5Min: txCount5m,
      transactionsLast1Hour: txCount1h,
      dailyTransactionAverage: dailyTxAvg,
      newDevice: isNewDevice,
      locationChanged: isLocationChanged,
      failedTransactions: failedTxCount,
      accountAgeDays: accountAge,
      merchantCategoryCode,
      merchantCategory: tx.merchantCategory,
      paymentMethodCode,
      paymentMethod: tx.paymentMethod,
      merchantRiskLevel,
      hourOfDay,
      deviceAgeDays,
    };

    return {
      vector,
      featureMap,
      featureNames: [...ML_FEATURE_NAMES],
    };
  }
}
