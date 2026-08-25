import { Transaction, UserProfile, BehavioralFeatures } from '../../../shared/types';

export class BehavioralEngine {
  public static extractBehavioralFeatures(
    tx: Transaction,
    user: UserProfile | null,
    userTransactions: Transaction[]
  ): BehavioralFeatures {
    const userAvg = user ? user.historicalAverageAmount : 5000;
    const amountRatio = Number((tx.amount / Math.max(1, userAvg)).toFixed(2));

    const txTime = new Date(tx.timestamp).getTime();

    // 5 minutes velocity window
    const count5m = userTransactions.filter((t) => {
      const diff = Math.abs(txTime - new Date(t.timestamp).getTime());
      return diff <= 5 * 60 * 1000;
    }).length;

    // 1 hour velocity window
    const count1h = userTransactions.filter((t) => {
      const diff = Math.abs(txTime - new Date(t.timestamp).getTime());
      return diff <= 60 * 60 * 1000;
    }).length;

    const avgDaily = user ? Math.max(0.5, Number((user.totalTransactionsCount / Math.max(1, user.accountAgeDays)).toFixed(2))) : 1.0;
    const isNewDevice = user ? !user.knownDevices.includes(tx.deviceId) : true;
    const isLocationChanged = user ? !user.knownLocations.some((loc) => tx.location.includes(loc) || loc.includes(tx.location)) : false;
    const failedRecent = user ? user.failedTransactionsCountLast30Days : 0;
    const accountAge = user ? user.accountAgeDays : 365;

    const unusualCategories = ['Cryptocurrency Exchange', 'Precious Metals', 'Digital Goods & Vouchers', 'Electronics & High-Risk Goods'];
    const isUnusualMerchant = unusualCategories.includes(tx.merchantCategory);
    const isUnusualPayment = tx.paymentMethod === 'NET_BANKING' && amountRatio > 4;

    // Continuous Anomaly Scoring (0 to 100)
    let score = 0;

    // Amount component: Sigmoid-like continuous scale
    if (amountRatio > 1.5) {
      score += Math.min(45, (amountRatio - 1) * 3.8);
    }

    // Velocity component
    if (count5m >= 2) {
      score += Math.min(30, (count5m - 1) * 9);
    } else if (count1h >= 4) {
      score += 15;
    }

    // Device anomaly
    if (isNewDevice) {
      score += 18;
    }

    // Location anomaly
    if (isLocationChanged) {
      score += 22;
    }

    // Account age vulnerability
    if (accountAge < 7) {
      score += 15;
    }

    // Failure history
    if (failedRecent >= 2) {
      score += Math.min(15, failedRecent * 4);
    }

    // Merchant deviation
    if (isUnusualMerchant) {
      score += 10;
    }

    const behavioralAnomalyScore = Math.min(100, Math.max(5, Math.round(score)));

    return {
      userAverageAmount: userAvg,
      currentAmountRatio: amountRatio,
      txCountLast5Minutes: count5m,
      txCountLast1Hour: count1h,
      avgDailyTxCount: avgDaily,
      isNewDevice,
      isLocationChanged,
      failedTxCountRecent: failedRecent,
      accountAgeDays: accountAge,
      isUnusualMerchantCategory: isUnusualMerchant,
      isUnusualPaymentMethod: isUnusualPayment,
      behavioralAnomalyScore,
    };
  }
}
