import { Router } from 'express';
import { RiskController } from '../controllers/riskController';

const router = Router();

// Health & System Status
router.get('/health', RiskController.getHealth);

// Dashboard
router.get('/dashboard/metrics', RiskController.getDashboardMetrics);

// Transactions
router.get('/transactions', RiskController.getTransactions);
router.get('/transactions/:id', RiskController.getTransactionById);

// Users
router.get('/users/:id', RiskController.getUserById);

// Risk Engine
router.get('/risk/:transactionId', RiskController.getRiskByTransactionId);

// Alerts
router.get('/alerts', RiskController.getAlerts);
router.patch('/alerts/:id', RiskController.updateAlertStatus);

// Investigations
router.get('/investigations/:transactionId', RiskController.getInvestigation);
router.post('/investigations', RiskController.runInvestigation);

// AI Agent Endpoints
router.post('/ai/investigate', RiskController.runInvestigation);
router.post('/ai/chat', RiskController.handleAIChat);

// System Reset
router.post('/system/reset', RiskController.resetData);

export default router;
