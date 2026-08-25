import { UserProfile, Transaction, RiskAlert, InvestigationReport, RiskAnalysis } from '../../../shared/types';
import { INITIAL_USERS, INITIAL_TRANSACTIONS, INITIAL_ALERTS } from './syntheticData';

export interface DatabaseAdapter {
  getUsers(): Promise<UserProfile[]>;
  getUserById(id: string): Promise<UserProfile | null>;
  getTransactions(): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | null>;
  getUserTransactions(userId: string): Promise<Transaction[]>;
  getAlerts(): Promise<RiskAlert[]>;
  getAlertById(id: string): Promise<RiskAlert | null>;
  updateAlertStatus(id: string, status: RiskAlert['status']): Promise<RiskAlert | null>;
  saveInvestigation(report: InvestigationReport): Promise<InvestigationReport>;
  getInvestigationByTransactionId(txId: string): Promise<InvestigationReport | null>;
  saveRiskAnalysis(analysis: RiskAnalysis): Promise<RiskAnalysis>;
  getRiskAnalysisByTransactionId(txId: string): Promise<RiskAnalysis | null>;
  addTransaction(tx: Transaction): Promise<Transaction>;
  resetToDefault(): Promise<void>;
  isPostgresConnected(): boolean;
}

class InMemoryDatabaseAdapter implements DatabaseAdapter {
  private users: Map<string, UserProfile> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private alerts: Map<string, RiskAlert> = new Map();
  private investigations: Map<string, InvestigationReport> = new Map();
  private riskAnalyses: Map<string, RiskAnalysis> = new Map();

  constructor() {
    this.seed();
  }

  public seed(): void {
    this.users.clear();
    this.transactions.clear();
    this.alerts.clear();
    this.investigations.clear();
    this.riskAnalyses.clear();

    INITIAL_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    INITIAL_TRANSACTIONS.forEach((t) => this.transactions.set(t.id, { ...t }));
    INITIAL_ALERTS.forEach((a) => this.alerts.set(a.id, { ...a }));
  }

  public isPostgresConnected(): boolean {
    return false; // In-memory demo fallback active
  }

  public async getUsers(): Promise<UserProfile[]> {
    return Array.from(this.users.values());
  }

  public async getUserById(id: string): Promise<UserProfile | null> {
    return this.users.get(id) || null;
  }

  public async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public async getTransactionById(id: string): Promise<Transaction | null> {
    const tx = this.transactions.get(id);
    if (!tx) return null;
    const user = this.users.get(tx.userId);
    return {
      ...tx,
      userSnapshot: user || undefined,
    };
  }

  public async getUserTransactions(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async getAlerts(): Promise<RiskAlert[]> {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public async getAlertById(id: string): Promise<RiskAlert | null> {
    return this.alerts.get(id) || null;
  }

  public async updateAlertStatus(id: string, status: RiskAlert['status']): Promise<RiskAlert | null> {
    const alert = this.alerts.get(id);
    if (!alert) return null;
    alert.status = status;
    this.alerts.set(id, alert);
    return alert;
  }

  public async saveInvestigation(report: InvestigationReport): Promise<InvestigationReport> {
    this.investigations.set(report.transactionId, report);
    return report;
  }

  public async getInvestigationByTransactionId(txId: string): Promise<InvestigationReport | null> {
    return this.investigations.get(txId) || null;
  }

  public async saveRiskAnalysis(analysis: RiskAnalysis): Promise<RiskAnalysis> {
    this.riskAnalyses.set(analysis.transactionId, analysis);
    return analysis;
  }

  public async getRiskAnalysisByTransactionId(txId: string): Promise<RiskAnalysis | null> {
    return this.riskAnalyses.get(txId) || null;
  }

  public async addTransaction(tx: Transaction): Promise<Transaction> {
    this.transactions.set(tx.id, tx);
    return tx;
  }

  public async resetToDefault(): Promise<void> {
    this.seed();
  }
}

export const db: DatabaseAdapter = new InMemoryDatabaseAdapter();
