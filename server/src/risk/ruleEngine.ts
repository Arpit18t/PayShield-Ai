import { Transaction, UserProfile, RuleEvaluationResult } from '../../../shared/types';

export class RuleEngine {
  public static evaluateRules(
    tx: Transaction,
    user: UserProfile | null,
    recentUserTxs: Transaction[]
  ): { ruleScore: number; triggeredRules: RuleEvaluationResult[]; allRules: RuleEvaluationResult[] } {
    const allRules: RuleEvaluationResult[] = [];

    const baselineAvg = user ? user.historicalAverageAmount : 5000;
    const ratio = tx.amount / Math.max(1, baselineAvg);

    // Rule 1: High Amount Anomaly (> 5x historical average)
    const isAmountAnomaly = ratio >= 5.0;
    const amountScore = isAmountAnomaly ? Math.min(100, Math.round(40 + (ratio - 5) * 8)) : 0;
    allRules.push({
      ruleId: 'RULE_AMOUNT_ANOMALY',
      ruleName: 'Amount Spike Anomaly (>5x Historical Baseline)',
      triggered: isAmountAnomaly,
      severity: ratio > 10 ? 'CRITICAL' : ratio >= 5 ? 'HIGH' : 'LOW',
      observedValue: `₹${tx.amount.toLocaleString('en-IN')} (${ratio.toFixed(2)}x baseline)`,
      expectedBaseline: `₹${baselineAvg.toLocaleString('en-IN')} (User Avg)`,
      explanation: isAmountAnomaly
        ? `Transaction amount is ${ratio.toFixed(2)}x above the user's historical average of ₹${baselineAvg.toLocaleString('en-IN')}.`
        : `Transaction amount is within normal historical spending thresholds.`,
      scoreContribution: amountScore,
    });

    // Rule 2: New / Unrecognized Device
    const isNewDevice = user ? !user.knownDevices.includes(tx.deviceId) : true;
    allRules.push({
      ruleId: 'RULE_NEW_DEVICE',
      ruleName: 'Unrecognized Device Fingerprint',
      triggered: isNewDevice,
      severity: isNewDevice ? 'HIGH' : 'LOW',
      observedValue: tx.deviceId,
      expectedBaseline: user ? user.knownDevices.join(', ') : 'Known User Hardware',
      explanation: isNewDevice
        ? `Hardware fingerprint (${tx.deviceId}) has never been registered or verified on this account.`
        : `Device matches registered hardware signature.`,
      scoreContribution: isNewDevice ? 75 : 0,
    });

    // Rule 3: Transaction Velocity Anomaly
    const txTime = new Date(tx.timestamp).getTime();
    const txsIn5Mins = recentUserTxs.filter((t) => {
      const diff = Math.abs(txTime - new Date(t.timestamp).getTime());
      return diff <= 5 * 60 * 1000;
    }).length;

    const isVelocityTriggered = txsIn5Mins >= 3;
    allRules.push({
      ruleId: 'RULE_VELOCITY_BURST',
      ruleName: 'High-Frequency Velocity Anomaly',
      triggered: isVelocityTriggered,
      severity: txsIn5Mins >= 4 ? 'CRITICAL' : txsIn5Mins >= 3 ? 'HIGH' : 'LOW',
      observedValue: `${txsIn5Mins} transactions in last 5 minutes`,
      expectedBaseline: '≤ 1 transaction per 10 minutes',
      explanation: isVelocityTriggered
        ? `Observed ${txsIn5Mins} rapid transactions within 5 minutes, indicating potential automated harvesting or card testing.`
        : `Transaction velocity is within standard human baseline.`,
      scoreContribution: isVelocityTriggered ? Math.min(100, 50 + txsIn5Mins * 12) : 0,
    });

    // Rule 4: Location Anomaly / Impossible Travel
    const isLocationAnomaly = user ? !user.knownLocations.some((loc) => tx.location.includes(loc) || loc.includes(tx.location)) : false;
    allRules.push({
      ruleId: 'RULE_LOCATION_ANOMALY',
      ruleName: 'Geographical Deviation / Unrecognized Location',
      triggered: isLocationAnomaly,
      severity: isLocationAnomaly ? (tx.location.includes('Nigeria') || tx.location.includes('Dubai') || tx.location.includes('UK') ? 'CRITICAL' : 'HIGH') : 'LOW',
      observedValue: tx.location,
      expectedBaseline: user ? user.knownLocations.join(' | ') : 'Primary Home Region',
      explanation: isLocationAnomaly
        ? `Transaction originated from ${tx.location}, which deviates entirely from historical domestic geolocation history.`
        : `Transaction originated from a verified historical location.`,
      scoreContribution: isLocationAnomaly ? 80 : 0,
    });

    // Rule 5: Failed Transaction Pattern (Recent failed retries)
    const recentFailed = user ? user.failedTransactionsCountLast30Days : 0;
    const isFailedPattern = recentFailed >= 3;
    allRules.push({
      ruleId: 'RULE_FAILED_RETRY_PATTERN',
      ruleName: 'Repeated Prior Failure Spike',
      triggered: isFailedPattern,
      severity: recentFailed >= 4 ? 'HIGH' : isFailedPattern ? 'MEDIUM' : 'LOW',
      observedValue: `${recentFailed} recent payment failures`,
      expectedBaseline: '≤ 1 failure / 30 days',
      explanation: isFailedPattern
        ? `Multiple recent payment failures (${recentFailed}) recorded, a common signal of credential stuffing or stolen card testing.`
        : `Failure rate is within normal acceptable range.`,
      scoreContribution: isFailedPattern ? Math.min(100, 30 + recentFailed * 15) : 0,
    });

    // Rule 6: Account Behavior (New account + high value)
    const isNewAccount = user ? user.accountAgeDays <= 7 : false;
    const isNewAccountHighVal = isNewAccount && tx.amount >= 30000;
    allRules.push({
      ruleId: 'RULE_NEW_ACCOUNT_HIGH_VALUE',
      ruleName: 'New Account High-Value Exposure',
      triggered: isNewAccountHighVal,
      severity: isNewAccountHighVal ? 'CRITICAL' : 'LOW',
      observedValue: `Age: ${user?.accountAgeDays ?? 0} days | ₹${tx.amount.toLocaleString('en-IN')}`,
      expectedBaseline: 'Age > 30 days for amounts > ₹30,000',
      explanation: isNewAccountHighVal
        ? `Account was created only ${user?.accountAgeDays ?? 0} days ago and immediately initiated a high-value transaction of ₹${tx.amount.toLocaleString('en-IN')}.`
        : `Account age and transaction value balance conforms to risk policy.`,
      scoreContribution: isNewAccountHighVal ? 90 : 0,
    });

    // Rule 7: High-Risk Merchant Category
    const highRiskCategories = ['Precious Metals', 'Cryptocurrency Exchange', 'Digital Goods & Vouchers', 'Electronics & High-Risk Goods'];
    const isHighRiskMerchant = highRiskCategories.includes(tx.merchantCategory);
    allRules.push({
      ruleId: 'RULE_HIGH_RISK_MERCHANT',
      ruleName: 'High-Liquidity / High-Risk Merchant Category',
      triggered: isHighRiskMerchant && ratio > 2.0,
      severity: isHighRiskMerchant ? 'MEDIUM' : 'LOW',
      observedValue: `${tx.merchantCategory} (${tx.merchant})`,
      expectedBaseline: 'Standard Retail & Utility Merchants',
      explanation: isHighRiskMerchant
        ? `Merchant operates in a high-liquidity / cash-equivalent sector (${tx.merchantCategory}).`
        : `Standard merchant categorization.`,
      scoreContribution: isHighRiskMerchant && ratio > 2.0 ? 60 : 0,
    });

    const triggeredRules = allRules.filter((r) => r.triggered);

    // Compute Rule Score: Max rule contribution with additive dampening
    let ruleScore = 0;
    if (triggeredRules.length > 0) {
      const maxContribution = Math.max(...triggeredRules.map((r) => r.scoreContribution));
      const remainingSum = triggeredRules.reduce((acc, r) => acc + r.scoreContribution, 0) - maxContribution;
      ruleScore = Math.min(100, Math.round(maxContribution * 0.7 + (remainingSum / (triggeredRules.length || 1)) * 0.3));
    }

    return {
      ruleScore,
      triggeredRules,
      allRules,
    };
  }
}
