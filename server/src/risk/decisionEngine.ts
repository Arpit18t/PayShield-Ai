import { Transaction, UserProfile, RiskAnalysis, RiskLevel, DecisionType } from '../../../shared/types';
import { RuleEngine } from './ruleEngine';
import { BehavioralEngine } from './behavioralEngine';
import { MLRiskModel } from './mlModelInterface';

export class DecisionEngine {
  public static readonly RULE_WEIGHT = 0.40;
  public static readonly BEHAVIOR_WEIGHT = 0.35;
  public static readonly ML_WEIGHT = 0.25;

  public static evaluate(
    tx: Transaction,
    user: UserProfile | null,
    userTransactions: Transaction[]
  ): RiskAnalysis {
    // 1. Rule Engine Evaluation
    const { ruleScore, triggeredRules, allRules } = RuleEngine.evaluateRules(tx, user, userTransactions);

    // 2. Behavioral Anomaly Analysis
    const behavioralFeatures = BehavioralEngine.extractBehavioralFeatures(tx, user, userTransactions);
    const behaviorScore = behavioralFeatures.behavioralAnomalyScore;

    // 3. ML-Ready Predictive Scoring
    const mlBreakdown = MLRiskModel.predict(tx, user, behavioralFeatures, ruleScore);
    const mlScore = mlBreakdown.mlRawScore;

    // 4. Final Weighted Risk Calculation
    const weightedSum =
      ruleScore * this.RULE_WEIGHT +
      behaviorScore * this.BEHAVIOR_WEIGHT +
      mlScore * this.ML_WEIGHT;

    const finalScore = Math.min(100, Math.max(1, Math.round(weightedSum)));

    // 5. Risk Level Classification
    let riskLevel: RiskLevel = 'LOW';
    if (finalScore >= 71) {
      riskLevel = 'HIGH';
    } else if (finalScore >= 31) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    // 6. Deterministic Policy Decision Engine
    let decision: DecisionType = 'ALLOW';
    let decisionReason = 'Transaction parameters conform with expected user baseline and historical thresholds.';

    if (riskLevel === 'HIGH') {
      const hasCriticalTrigger = triggeredRules.some((r) => r.severity === 'CRITICAL');
      if (finalScore >= 85 || hasCriticalTrigger) {
        decision = 'TEMPORARY_HOLD';
        decisionReason = 'Critical multi-vector anomalies detected. Transaction temporarily held pending L2 risk investigator verification.';
      } else {
        decision = 'MANUAL_REVIEW';
        decisionReason = 'Elevated aggregate risk score requires manual analyst review before settlement.';
      }
    } else if (riskLevel === 'MEDIUM') {
      decision = 'STEP_UP_VERIFICATION';
      decisionReason = 'Moderate behavioral deviation observed. Step-up multi-factor authentication / biometric OTP challenge dispatched.';
    } else {
      decision = 'ALLOW';
      decisionReason = 'Low risk profile. Cleared for straight-through settlement.';
    }

    return {
      transactionId: tx.id,
      evaluatedAt: new Date().toISOString(),
      ruleScore,
      behaviorScore,
      mlScore,
      finalScore,
      riskLevel,
      decision,
      decisionReason,
      triggeredRules,
      allRules,
      behavioralFeatures,
      mlBreakdown,
    };
  }
}
