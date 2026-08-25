import { Request, Response } from 'express';
import { db } from '../database/db';
import { DecisionEngine } from '../risk/decisionEngine';
import { GeminiInvestigator } from '../agents/geminiInvestigator';
import { AnalystChatAgent } from '../agents/analystChat';
import { MLRiskService } from '../ml/mlService';
import { DashboardMetrics, Transaction, RiskAnalysis } from '../../../shared/types';

export class RiskController {
  // Helper to ensure risk analysis is cached or computed
  private static async getOrComputeRisk(tx: Transaction): Promise<RiskAnalysis> {
    let analysis = await db.getRiskAnalysisByTransactionId(tx.id);
    if (!analysis) {
      const user = await db.getUserById(tx.userId);
      const userHistory = await db.getUserTransactions(tx.userId);
      analysis = DecisionEngine.evaluate(tx, user, userHistory);
      await db.saveRiskAnalysis(analysis);
    }
    return analysis;
  }

  public static async getHealth(_req: Request, res: Response): Promise<void> {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY';
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      platform: 'PayShield AI - Enterprise Risk Management',
      version: '1.0.0',
      database: {
        type: db.isPostgresConnected() ? 'PostgreSQL' : 'In-Memory Demo Adapter',
        ready: true,
      },
      aiEngine: {
        provider: 'Google Gemini 3.7 Flash',
        serverSide: true,
        configured: hasGeminiKey,
        fallbackActive: !hasGeminiKey,
      },
    });
  }

  public static async getDashboardMetrics(_req: Request, res: Response): Promise<void> {
    const transactions = await db.getTransactions();
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let blockedCount = 0;
    let underReviewCount = 0;
    let allowedCount = 0;
    let totalScoreSum = 0;
    let totalVolume = 0;

    for (const tx of transactions) {
      totalVolume += tx.amount;
      const risk = await RiskController.getOrComputeRisk(tx);
      totalScoreSum += risk.finalScore;

      if (risk.riskLevel === 'HIGH') highRiskCount++;
      else if (risk.riskLevel === 'MEDIUM') mediumRiskCount++;
      else lowRiskCount++;

      if (risk.decision === 'TEMPORARY_HOLD' || tx.status === 'BLOCKED') blockedCount++;
      else if (risk.decision === 'MANUAL_REVIEW' || risk.decision === 'STEP_UP_VERIFICATION') underReviewCount++;
      else allowedCount++;
    }

    const total = transactions.length || 1;
    const mlMetrics = MLRiskService.getInstance().getModelMetrics();

    const metrics: DashboardMetrics = {
      totalTransactions: transactions.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      blockedCount,
      underReviewCount,
      allowedCount,
      totalVolumeINR: totalVolume,
      avgRiskScore: Math.round(totalScoreSum / total),
      highRiskRatePercent: Number(((highRiskCount / total) * 100).toFixed(1)),
      mlMetrics,
      trends: {
        totalChangePercent: 12.4,
        highRiskChangePercent: -3.2,
        blockedChangePercent: 8.5,
        reviewChangePercent: 5.1,
      },
    };

    res.json(metrics);
  }

  public static async getMLModelMetrics(_req: Request, res: Response): Promise<void> {
    const metrics = MLRiskService.getInstance().getModelMetrics();
    res.json(metrics);
  }

  public static async getMLModelStatus(_req: Request, res: Response): Promise<void> {
    const status = MLRiskService.getInstance().getModelStatus();
    res.json(status);
  }

  public static async getTransactions(req: Request, res: Response): Promise<void> {
    const { search, riskLevel, decision, paymentMethod, minAmount, maxAmount } = req.query;
    let transactions = await db.getTransactions();

    // Map each with its calculated risk
    const enrichedList = await Promise.all(
      transactions.map(async (tx) => {
        const risk = await RiskController.getOrComputeRisk(tx);
        return {
          ...tx,
          riskScore: risk.finalScore,
          riskLevel: risk.riskLevel,
          decision: risk.decision,
        };
      })
    );

    let filtered = enrichedList;

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.userId.toLowerCase().includes(q) ||
          t.merchant.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }

    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'ALL') {
      filtered = filtered.filter((t) => t.riskLevel === riskLevel);
    }

    if (decision && typeof decision === 'string' && decision !== 'ALL') {
      filtered = filtered.filter((t) => t.decision === decision);
    }

    if (paymentMethod && typeof paymentMethod === 'string' && paymentMethod !== 'ALL') {
      filtered = filtered.filter((t) => t.paymentMethod === paymentMethod);
    }

    if (minAmount) {
      filtered = filtered.filter((t) => t.amount >= Number(minAmount));
    }

    if (maxAmount) {
      filtered = filtered.filter((t) => t.amount <= Number(maxAmount));
    }

    res.json(filtered);
  }

  public static async getTransactionById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const tx = await db.getTransactionById(id);
    if (!tx) {
      res.status(404).json({ error: `Transaction ${id} not found.` });
      return;
    }

    const user = await db.getUserById(tx.userId);
    const userHistory = await db.getUserTransactions(tx.userId);
    const riskAnalysis = await RiskController.getOrComputeRisk(tx);
    const existingInvestigation = await db.getInvestigationByTransactionId(tx.id);

    res.json({
      transaction: tx,
      user,
      userHistory: userHistory.slice(0, 10),
      riskAnalysis,
      investigation: existingInvestigation,
    });
  }

  public static async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await db.getUserById(id);
    if (!user) {
      res.status(404).json({ error: `User ${id} not found.` });
      return;
    }
    const txs = await db.getUserTransactions(id);
    res.json({ user, transactions: txs });
  }

  public static async getRiskByTransactionId(req: Request, res: Response): Promise<void> {
    const { transactionId } = req.params;
    const tx = await db.getTransactionById(transactionId);
    if (!tx) {
      res.status(404).json({ error: `Transaction ${transactionId} not found.` });
      return;
    }
    const risk = await RiskController.getOrComputeRisk(tx);
    res.json(risk);
  }

  public static async getAlerts(req: Request, res: Response): Promise<void> {
    const { status, severity, type } = req.query;
    let alerts = await db.getAlerts();

    if (status && typeof status === 'string' && status !== 'ALL') {
      alerts = alerts.filter((a) => a.status === status);
    }
    if (severity && typeof severity === 'string' && severity !== 'ALL') {
      alerts = alerts.filter((a) => a.severity === severity);
    }
    if (type && typeof type === 'string' && type !== 'ALL') {
      alerts = alerts.filter((a) => a.type === type);
    }

    res.json(alerts);
  }

  public static async updateAlertStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }
    const updated = await db.updateAlertStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    res.json(updated);
  }

  public static async getInvestigation(req: Request, res: Response): Promise<void> {
    const { transactionId } = req.params;
    const inv = await db.getInvestigationByTransactionId(transactionId);
    if (!inv) {
      res.status(404).json({ error: 'Investigation not found for this transaction.' });
      return;
    }
    res.json(inv);
  }

  public static async runInvestigation(req: Request, res: Response): Promise<void> {
    const { transactionId, forceRefresh } = req.body;
    if (!transactionId) {
      res.status(400).json({ error: 'transactionId is required' });
      return;
    }

    const tx = await db.getTransactionById(transactionId);
    if (!tx) {
      res.status(404).json({ error: `Transaction ${transactionId} not found.` });
      return;
    }

    if (!forceRefresh) {
      const existing = await db.getInvestigationByTransactionId(transactionId);
      if (existing) {
        res.json(existing);
        return;
      }
    }

    const user = await db.getUserById(tx.userId);
    const userHistory = await db.getUserTransactions(tx.userId);
    const riskAnalysis = await RiskController.getOrComputeRisk(tx);

    const report = await GeminiInvestigator.investigateTransaction(tx, user, userHistory, riskAnalysis);
    await db.saveInvestigation(report);

    res.json(report);
  }

  public static async handleAIChat(req: Request, res: Response): Promise<void> {
    const { question, transactionId } = req.body;
    if (!question || !transactionId) {
      res.status(400).json({ error: 'question and transactionId are required.' });
      return;
    }

    const tx = await db.getTransactionById(transactionId);
    if (!tx) {
      res.status(404).json({ error: `Transaction ${transactionId} not found.` });
      return;
    }

    const user = await db.getUserById(tx.userId);
    const userHistory = await db.getUserTransactions(tx.userId);
    const riskAnalysis = await RiskController.getOrComputeRisk(tx);
    const investigation = await db.getInvestigationByTransactionId(transactionId);

    const result = await AnalystChatAgent.answerQuestion(
      question,
      tx,
      user,
      userHistory,
      riskAnalysis,
      investigation
    );

    res.json(result);
  }

  public static async resetData(_req: Request, res: Response): Promise<void> {
    await db.resetToDefault();
    res.json({ message: 'Synthetic dataset re-seeded to factory baseline successfully.' });
  }
}
