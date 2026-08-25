export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type DecisionType = 'ALLOW' | 'STEP_UP_VERIFICATION' | 'MANUAL_REVIEW' | 'TEMPORARY_HOLD';
export type PaymentMethod = 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING' | 'WALLET';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'BLOCKED' | 'FLAGGED';
export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertType = 
  | 'HIGH_RISK_TRANSACTION'
  | 'NEW_DEVICE'
  | 'VELOCITY_ANOMALY'
  | 'LOCATION_ANOMALY'
  | 'REPEATED_FAILURES'
  | 'UNUSUAL_AMOUNT'
  | 'MERCHANT_DEVIATION';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountAgeDays: number;
  historicalAverageAmount: number;
  historicalMaxAmount: number;
  usualLocation: string;
  usualDevice: string;
  knownDevices: string[];
  knownLocations: string[];
  totalTransactionsCount: number;
  failedTransactionsCountLast30Days: number;
  riskTier: 'STANDARD' | 'ELEVATED' | 'HIGH_MONITORING';
  createdDate: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  merchant: string;
  merchantCategory: string;
  location: string;
  deviceId: string;
  deviceType?: string;
  ipAddress?: string;
  timestamp: string;
  status: TransactionStatus;
  userSnapshot?: UserProfile;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedValue: string;
  expectedBaseline: string;
  explanation: string;
  scoreContribution: number; // 0 to 100
}

export interface BehavioralFeatures {
  userAverageAmount: number;
  currentAmountRatio: number;
  txCountLast5Minutes: number;
  txCountLast1Hour: number;
  avgDailyTxCount: number;
  isNewDevice: boolean;
  isLocationChanged: boolean;
  failedTxCountRecent: number;
  accountAgeDays: number;
  isUnusualMerchantCategory: boolean;
  isUnusualPaymentMethod: boolean;
  behavioralAnomalyScore: number; // 0 to 100
}

export interface MLScoreBreakdown {
  mlModelVersion: string;
  mlRawScore: number; // 0 to 100
  featureImportances: {
    featureName: string;
    weight: number;
    contribution: number;
  }[];
}

export interface RiskAnalysis {
  transactionId: string;
  evaluatedAt: string;
  ruleScore: number; // 0 to 100 (40% weight)
  behaviorScore: number; // 0 to 100 (35% weight)
  mlScore: number; // 0 to 100 (25% weight)
  finalScore: number; // 0 to 100
  riskLevel: RiskLevel;
  decision: DecisionType;
  decisionReason: string;
  triggeredRules: RuleEvaluationResult[];
  allRules: RuleEvaluationResult[];
  behavioralFeatures: BehavioralFeatures;
  mlBreakdown: MLScoreBreakdown;
}

export interface InvestigationReport {
  id: string;
  transactionId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  investigationSummary: string;
  primaryRiskFactors: string[];
  supportingEvidence: string[];
  confidence: number; // 0 to 100
  recommendedAction: string;
  engineType: 'GEMINI_AI' | 'DETERMINISTIC_FALLBACK';
  modelUsed?: string;
  createdAt: string;
  analystNotes?: string;
}

export interface RiskAlert {
  id: string;
  transactionId: string;
  userId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  riskScore: number;
  amount: number;
  currency: string;
  timestamp: string;
  assignedTo?: string;
}

export interface DashboardMetrics {
  totalTransactions: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  blockedCount: number;
  underReviewCount: number;
  allowedCount: number;
  totalVolumeINR: number;
  avgRiskScore: number;
  highRiskRatePercent: number;
  trends: {
    totalChangePercent: number;
    highRiskChangePercent: number;
    blockedChangePercent: number;
    reviewChangePercent: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  evidenceReferences?: string[];
}
