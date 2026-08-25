import {
  Transaction,
  UserProfile,
  RiskAnalysis,
  InvestigationReport,
  RiskAlert,
  DashboardMetrics,
  ChatMessage,
} from '../../shared/types';

const BASE_URL = '/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${BASE_URL}/dashboard/metrics`);
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  },

  async getTransactions(params?: {
    search?: string;
    riskLevel?: string;
    decision?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<(Transaction & { riskScore: number; riskLevel: string; decision: string })[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.riskLevel && params.riskLevel !== 'ALL') query.set('riskLevel', params.riskLevel);
    if (params?.decision && params.decision !== 'ALL') query.set('decision', params.decision);
    if (params?.paymentMethod && params.paymentMethod !== 'ALL') query.set('paymentMethod', params.paymentMethod);
    if (params?.minAmount) query.set('minAmount', params.minAmount.toString());
    if (params?.maxAmount) query.set('maxAmount', params.maxAmount.toString());

    const res = await fetch(`${BASE_URL}/transactions?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load transactions');
    return res.json();
  },

  async getTransactionDetails(id: string): Promise<{
    transaction: Transaction;
    user: UserProfile | null;
    userHistory: Transaction[];
    riskAnalysis: RiskAnalysis;
    investigation: InvestigationReport | null;
  }> {
    const res = await fetch(`${BASE_URL}/transactions/${id}`);
    if (!res.ok) throw new Error(`Failed to load transaction ${id}`);
    return res.json();
  },

  async getAlerts(params?: {
    status?: string;
    severity?: string;
    type?: string;
  }): Promise<RiskAlert[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.severity && params.severity !== 'ALL') query.set('severity', params.severity);
    if (params?.type && params.type !== 'ALL') query.set('type', params.type);

    const res = await fetch(`${BASE_URL}/alerts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load alerts');
    return res.json();
  },

  async updateAlertStatus(id: string, status: RiskAlert['status']): Promise<RiskAlert> {
    const res = await fetch(`${BASE_URL}/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update alert');
    return res.json();
  },

  async runInvestigation(transactionId: string, forceRefresh = false): Promise<InvestigationReport> {
    const res = await fetch(`${BASE_URL}/ai/investigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, forceRefresh }),
    });
    if (!res.ok) throw new Error('Failed to run AI investigation');
    return res.json();
  },

  async sendAIChat(
    transactionId: string,
    question: string
  ): Promise<{ answer: string; suggestedQuestions: string[]; evidenceReferences: string[] }> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, question }),
    });
    if (!res.ok) throw new Error('Failed to send AI chat question');
    return res.json();
  },

  async resetData(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/system/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset dataset');
    return res.json();
  },
};
