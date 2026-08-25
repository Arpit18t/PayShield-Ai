import { Transaction, UserProfile, BehavioralFeatures, MLScoreBreakdown } from '../../../shared/types';
import { MLRiskService } from '../ml/mlService';

export class MLRiskModel {
  /**
   * ML risk prediction interface backed by the real trained GBDT classifier.
   * Computes an ensemble risk probability score (0-100), calibrated probability, and feature importances.
   */
  public static predict(
    tx: Transaction,
    user: UserProfile | null,
    _behavioral: BehavioralFeatures,
    _ruleScore: number,
    userHistory: Transaction[] = []
  ): MLScoreBreakdown {
    return MLRiskService.getInstance().predictRisk(tx, user, userHistory);
  }
}
