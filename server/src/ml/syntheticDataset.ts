import { SyntheticDataSample } from './types';

/**
 * Deterministic pseudo-random number generator (Mulberry32).
 * Ensures 100% reproducible synthetic dataset generation across runs.
 */
class PRNG {
  private s: number;

  constructor(seed: number) {
    this.s = seed | 0;
  }

  public next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public uniform(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  public int(min: number, max: number): number {
    return Math.floor(this.uniform(min, max + 1));
  }

  public choice<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }

  public bool(probabilityOfTrue = 0.5): boolean {
    return this.next() < probabilityOfTrue;
  }
}

export class SyntheticDatasetGenerator {
  public static generateDataset(sampleCount = 5000, seed = 42): SyntheticDataSample[] {
    const rng = new PRNG(seed);
    const dataset: SyntheticDataSample[] = [];

    // Target distribution: ~78% legitimate, ~22% risky
    for (let i = 0; i < sampleCount; i++) {
      const isAnomalousScenario = rng.next() < 0.22;

      if (!isAnomalousScenario) {
        // === NORMAL / BENIGN SCENARIOS ===
        const normalType = rng.choice([
          'ROUTINE_TRANSACTION',
          'AFFLUENT_HIGH_VALUE',
          'BENIGN_NEW_DEVICE',
          'BENIGN_TRAVEL_LOCATION',
          'SALARY_DAY_ELEVATION',
        ]);

        let baselineAvg = rng.uniform(2500, 15000);
        let amountRatio = rng.uniform(0.4, 1.3);
        let amount = Math.round(baselineAvg * amountRatio);
        let txCount5m = rng.choice([1, 1, 1, 1, 2]);
        let txCount1h = txCount5m + rng.choice([0, 1, 1, 2]);
        let accountAge = rng.int(60, 1200);
        let dailyAvg = Number((rng.uniform(0.3, 2.5)).toFixed(2));
        let newDevice = 0;
        let locationChanged = 0;
        let failedTxCount = rng.choice([0, 0, 0, 1]);
        let merchantCategoryCode = rng.choice([0, 1, 2, 3, 4, 5]); // Groceries, Food, Utilities, Pharmacy, Retail
        let paymentMethodCode = rng.choice([0, 1, 2, 3, 4]); // UPI, Credit, Debit, NetBanking, Wallet
        let merchantRiskLevel = 0;
        let hourOfDay = rng.int(7, 22); // Normal daytime
        let deviceAgeDays = rng.int(30, 400);

        switch (normalType) {
          case 'AFFLUENT_HIGH_VALUE':
            // High-value legitimate transaction (e.g. VIP cardholder purchasing luxury or electronics)
            baselineAvg = rng.uniform(50000, 120000);
            amountRatio = rng.uniform(0.8, 1.4);
            amount = Math.round(baselineAvg * amountRatio);
            accountAge = rng.int(250, 1500);
            merchantCategoryCode = rng.choice([4, 6, 7, 10]); // Retail, Travel, Luxury, Electronics
            merchantRiskLevel = 1;
            break;

          case 'BENIGN_NEW_DEVICE':
            // Genuine user buying phone or new laptop - new device flag is 1, but amount & location are safe
            newDevice = 1;
            deviceAgeDays = 0;
            amountRatio = rng.uniform(0.5, 1.1);
            amount = Math.round(baselineAvg * amountRatio);
            break;

          case 'BENIGN_TRAVEL_LOCATION':
            // Genuine user on domestic business travel / vacation - location changed is 1, but device is known
            locationChanged = 1;
            amountRatio = rng.uniform(0.7, 1.5);
            amount = Math.round(baselineAvg * amountRatio);
            merchantCategoryCode = rng.choice([4, 6, 1]); // Dining, Hotel/Travel, Convenience
            break;

          case 'SALARY_DAY_ELEVATION':
            // Monthly bill or rent payment
            amountRatio = rng.uniform(1.6, 2.5);
            amount = Math.round(baselineAvg * amountRatio);
            merchantCategoryCode = rng.choice([2, 5]); // Utilities, Education/Rent
            break;

          case 'ROUTINE_TRANSACTION':
          default:
            break;
        }

        // Add subtle boundary noise in ~2.5% of samples
        let label: 0 | 1 = 0;
        if (rng.next() < 0.025) {
          label = 1; // Subtle noise
        }

        const features = [
          amount,
          baselineAvg,
          Number(amountRatio.toFixed(2)),
          txCount5m,
          txCount1h,
          dailyAvg,
          newDevice,
          locationChanged,
          failedTxCount,
          accountAge,
          merchantCategoryCode,
          paymentMethodCode,
          merchantRiskLevel,
          hourOfDay,
          deviceAgeDays,
        ];

        dataset.push({
          features,
          isRisky: label,
          metadata: {
            scenario: normalType,
            amount,
            amountRatio,
            merchantCategory: `Cat-${merchantCategoryCode}`,
          },
        });
      } else {
        // === ANOMALOUS / RISKY SCENARIOS ===
        const anomalyType = rng.choice([
          'AMOUNT_SPIKE',
          'VELOCITY_BURST',
          'MICRO_CARD_TESTING',
          'LOCATION_NEW_DEVICE',
          'NEW_ACCOUNT_EXPOSURE',
          'MULTI_WEAK_SIGNALS',
          'HIGH_RISK_MERCHANT_BURST',
          'REPEATED_FAILURES_RETRY',
        ]);

        let baselineAvg = rng.uniform(2000, 12000);
        let amountRatio = 1.0;
        let amount = 5000;
        let txCount5m = 1;
        let txCount1h = 1;
        let accountAge = rng.int(30, 600);
        let dailyAvg = 0.5;
        let newDevice = 0;
        let locationChanged = 0;
        let failedTxCount = 0;
        let merchantCategoryCode = 4;
        let paymentMethodCode = 0;
        let merchantRiskLevel = 0;
        let hourOfDay = rng.int(0, 23);
        let deviceAgeDays = 30;

        switch (anomalyType) {
          case 'MICRO_CARD_TESTING':
            // Low-value transaction testing (e.g. ₹80 to ₹350 card authorization probe with high velocity)
            amount = rng.int(60, 350);
            amountRatio = Number((amount / Math.max(1, baselineAvg)).toFixed(2));
            txCount5m = rng.int(4, 9);
            txCount1h = txCount5m + rng.int(2, 6);
            newDevice = rng.bool(0.75) ? 1 : 0;
            failedTxCount = rng.int(2, 6);
            merchantCategoryCode = rng.choice([8, 9, 12]); // Digital vouchers, gaming, crypto
            merchantRiskLevel = 2;
            hourOfDay = rng.choice([0, 1, 2, 3, 4, 23]);
            break;

          case 'MULTI_WEAK_SIGNALS':
            // Multiple weak signals combining (moderate amount + new merchant + late night + 1 failure)
            amountRatio = rng.uniform(2.1, 3.4);
            amount = Math.round(baselineAvg * amountRatio);
            merchantCategoryCode = rng.choice([10, 11, 12]); // Electronics, Bullion, Crypto
            merchantRiskLevel = 2;
            hourOfDay = rng.choice([1, 2, 3, 4]); // Nocturnal window
            failedTxCount = rng.choice([1, 2]);
            newDevice = rng.bool(0.4) ? 1 : 0;
            break;

          case 'AMOUNT_SPIKE':
            amountRatio = rng.uniform(6.0, 25.0);
            amount = Math.round(baselineAvg * amountRatio);
            newDevice = rng.bool(0.65) ? 1 : 0;
            merchantCategoryCode = rng.choice([10, 11, 12, 7]); // Electronics, Bullion, Crypto, Luxury
            merchantRiskLevel = 2;
            break;

          case 'VELOCITY_BURST':
            txCount5m = rng.int(4, 12);
            txCount1h = txCount5m + rng.int(2, 8);
            amountRatio = rng.uniform(1.8, 7.5);
            amount = Math.round(baselineAvg * amountRatio);
            merchantCategoryCode = rng.choice([8, 9, 10, 12]); // Gaming, Vouchers, Crypto
            merchantRiskLevel = 2;
            break;

          case 'LOCATION_NEW_DEVICE':
            newDevice = 1;
            locationChanged = 1;
            amountRatio = rng.uniform(3.0, 12.0);
            amount = Math.round(baselineAvg * amountRatio);
            hourOfDay = rng.choice([1, 2, 3, 4, 23]);
            deviceAgeDays = 0;
            merchantCategoryCode = rng.choice([9, 10, 11, 12]);
            merchantRiskLevel = 2;
            break;

          case 'NEW_ACCOUNT_EXPOSURE':
            accountAge = rng.int(1, 5);
            baselineAvg = 1500;
            amount = rng.int(40000, 150000);
            amountRatio = Number((amount / baselineAvg).toFixed(2));
            newDevice = 1;
            deviceAgeDays = 0;
            merchantCategoryCode = rng.choice([11, 12, 10]);
            merchantRiskLevel = 2;
            break;

          case 'HIGH_RISK_MERCHANT_BURST':
            merchantCategoryCode = 12; // Crypto Exchange
            merchantRiskLevel = 2;
            newDevice = 1;
            amountRatio = rng.uniform(3.5, 14.0);
            amount = Math.round(baselineAvg * amountRatio);
            txCount5m = rng.int(2, 6);
            break;

          case 'REPEATED_FAILURES_RETRY':
            failedTxCount = rng.int(4, 10);
            amountRatio = rng.uniform(2.5, 9.0);
            amount = Math.round(baselineAvg * amountRatio);
            txCount5m = rng.int(3, 7);
            newDevice = rng.bool(0.6) ? 1 : 0;
            break;
        }

        // Add subtle boundary noise in ~2.5% of samples
        let label: 0 | 1 = 1;
        if (rng.next() < 0.025) {
          label = 0; // Subtle noise
        }

        const features = [
          amount,
          baselineAvg,
          Number(amountRatio.toFixed(2)),
          txCount5m,
          txCount1h,
          dailyAvg,
          newDevice,
          locationChanged,
          failedTxCount,
          accountAge,
          merchantCategoryCode,
          paymentMethodCode,
          merchantRiskLevel,
          hourOfDay,
          deviceAgeDays,
        ];

        dataset.push({
          features,
          isRisky: label,
          metadata: {
            scenario: anomalyType,
            amount,
            amountRatio,
            merchantCategory: `Cat-${merchantCategoryCode}`,
          },
        });
      }
    }

    return dataset;
  }

  /**
   * Performs an exact stratified train/test split preserving class distribution.
   */
  public static stratifiedSplit(
    dataset: SyntheticDataSample[],
    trainRatio = 0.8,
    seed = 42
  ): { trainSet: SyntheticDataSample[]; testSet: SyntheticDataSample[] } {
    const positives = dataset.filter((d) => d.isRisky === 1);
    const negatives = dataset.filter((d) => d.isRisky === 0);

    const posTrainCount = Math.floor(positives.length * trainRatio);
    const negTrainCount = Math.floor(negatives.length * trainRatio);

    const trainSet = [...positives.slice(0, posTrainCount), ...negatives.slice(0, negTrainCount)];
    const testSet = [...positives.slice(posTrainCount), ...negatives.slice(negTrainCount)];

    // Deterministic shuffle of train and test sets
    const rng = new PRNG(seed + 101);
    for (let i = trainSet.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      [trainSet[i], trainSet[j]] = [trainSet[j], trainSet[i]];
    }
    for (let i = testSet.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      [testSet[i], testSet[j]] = [testSet[j], testSet[i]];
    }

    return { trainSet, testSet };
  }
}

