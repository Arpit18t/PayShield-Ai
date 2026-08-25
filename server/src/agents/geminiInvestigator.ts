import { GoogleGenAI } from '@google/genai';
import { Transaction, UserProfile, RiskAnalysis, InvestigationReport } from '../../../shared/types';

export class GeminiInvestigator {
  private static getAIClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  /**
   * Generates a deterministic investigation report without requiring Gemini.
   */
  public static generateFallbackInvestigation(
    tx: Transaction,
    user: UserProfile | null,
    riskAnalysis: RiskAnalysis
  ): InvestigationReport {
    const primaryFactors: string[] = [];
    const evidenceList: string[] = [];

    const baseline = user ? user.historicalAverageAmount : 5000;
    const ratio = (tx.amount / Math.max(1, baseline)).toFixed(2);

    if (riskAnalysis.behavioralFeatures.currentAmountRatio >= 4) {
      primaryFactors.push(`Transaction amount is ${ratio}x historical user baseline`);
      evidenceList.push(`Observed ₹${tx.amount.toLocaleString('en-IN')} vs historic baseline ₹${baseline.toLocaleString('en-IN')}`);
    }

    if (riskAnalysis.behavioralFeatures.isNewDevice) {
      primaryFactors.push('Unrecognized device hardware signature');
      evidenceList.push(`Device fingerprint ${tx.deviceId} not present in known user hardware [${user?.knownDevices.join(', ') || 'None'}]`);
    }

    if (riskAnalysis.behavioralFeatures.isLocationChanged) {
      primaryFactors.push('Geographical anomaly / unexpected location');
      evidenceList.push(`Origin location ${tx.location} deviates from usual location profile [${user?.usualLocation || 'Unknown'}]`);
    }

    if (riskAnalysis.behavioralFeatures.txCountLast5Minutes >= 3) {
      primaryFactors.push('Velocity burst pattern detected');
      evidenceList.push(`${riskAnalysis.behavioralFeatures.txCountLast5Minutes} transactions executed within a 5-minute window`);
    }

    if (user && user.accountAgeDays < 7 && tx.amount >= 30000) {
      primaryFactors.push('New account high exposure');
      evidenceList.push(`Account age is ${user.accountAgeDays} days with sudden high-value velocity`);
    }

    if (primaryFactors.length === 0) {
      primaryFactors.push('Standard transaction parameters verified');
      evidenceList.push('All deterministic risk rules evaluated within safe operational thresholds.');
    }

    let recommendation = 'Allow settlement';
    if (riskAnalysis.riskLevel === 'HIGH') {
      recommendation = riskAnalysis.finalScore >= 85
        ? 'Apply Temporary Hold & Contact Account Holder via Verified Out-of-Band Channel'
        : 'Conduct Immediate Manual Analyst Review & Request Secondary ID Confirmation';
    } else if (riskAnalysis.riskLevel === 'MEDIUM') {
      recommendation = 'Enforce Step-Up Biometric / SMS OTP Verification before authorization';
    }

    const summary = riskAnalysis.riskLevel === 'HIGH'
      ? `Transaction ${tx.id} for ₹${tx.amount.toLocaleString('en-IN')} was flagged with HIGH risk (Score: ${riskAnalysis.finalScore}/100) due to ${primaryFactors.join(', ')}. The risk decision engine applied ${riskAnalysis.decision}.`
      : riskAnalysis.riskLevel === 'MEDIUM'
      ? `Transaction ${tx.id} exhibits moderate risk indicators (Score: ${riskAnalysis.finalScore}/100) primarily driven by ${primaryFactors.join(' and ')}.`
      : `Transaction ${tx.id} cleared standard screening (Score: ${riskAnalysis.finalScore}/100) with no anomalous behavioral deviations.`;

    return {
      id: `INV-${tx.id}-${Date.now().toString().slice(-4)}`,
      transactionId: tx.id,
      riskScore: riskAnalysis.finalScore,
      riskLevel: riskAnalysis.riskLevel,
      investigationSummary: summary,
      primaryRiskFactors: primaryFactors,
      supportingEvidence: evidenceList,
      confidence: riskAnalysis.riskLevel === 'HIGH' ? 94 : 88,
      recommendedAction: recommendation,
      engineType: 'DETERMINISTIC_FALLBACK',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Runs an AI-driven investigation using Gemini 3.7 Flash, falling back gracefully if unavailable.
   */
  public static async investigateTransaction(
    tx: Transaction,
    user: UserProfile | null,
    userHistory: Transaction[],
    riskAnalysis: RiskAnalysis
  ): Promise<InvestigationReport> {
    const ai = this.getAIClient();

    if (!ai) {
      return this.generateFallbackInvestigation(tx, user, riskAnalysis);
    }

    try {
      const contextData = {
        transaction: {
          id: tx.id,
          amount: `₹${tx.amount.toLocaleString('en-IN')} (${tx.currency})`,
          paymentMethod: tx.paymentMethod,
          merchant: tx.merchant,
          merchantCategory: tx.merchantCategory,
          location: tx.location,
          deviceId: tx.deviceId,
          deviceType: tx.deviceType,
          ipAddress: tx.ipAddress,
          timestamp: tx.timestamp,
        },
        userProfile: user
          ? {
              id: user.id,
              name: user.name,
              accountAgeDays: user.accountAgeDays,
              historicalAverageAmount: `₹${user.historicalAverageAmount.toLocaleString('en-IN')}`,
              usualLocation: user.usualLocation,
              knownDevices: user.knownDevices,
              knownLocations: user.knownLocations,
              failedTxLast30Days: user.failedTransactionsCountLast30Days,
              riskTier: user.riskTier,
            }
          : null,
        riskAnalysis: {
          finalScore: riskAnalysis.finalScore,
          riskLevel: riskAnalysis.riskLevel,
          ruleScore: riskAnalysis.ruleScore,
          behaviorScore: riskAnalysis.behaviorScore,
          mlScore: riskAnalysis.mlScore,
          deterministicDecision: riskAnalysis.decision,
          triggeredRules: riskAnalysis.triggeredRules.map((r) => ({
            rule: r.ruleName,
            observed: r.observedValue,
            expected: r.expectedBaseline,
            severity: r.severity,
          })),
          behavioralFeatures: {
            amountRatio: `${riskAnalysis.behavioralFeatures.currentAmountRatio}x`,
            txCount5m: riskAnalysis.behavioralFeatures.txCountLast5Minutes,
            isNewDevice: riskAnalysis.behavioralFeatures.isNewDevice,
            isLocationChanged: riskAnalysis.behavioralFeatures.isLocationChanged,
          },
        },
        recentHistorySummary: userHistory.slice(0, 5).map((h) => ({
          id: h.id,
          amount: `₹${h.amount}`,
          location: h.location,
          deviceId: h.deviceId,
          status: h.status,
          time: h.timestamp,
        })),
      };

      const prompt = `You are PayShield AI's Senior Fraud Intelligence Investigator.
Analyze the following payment transaction risk context and produce an explainable, forensic investigation report.

Context:
${JSON.stringify(contextData, null, 2)}

Provide your response in valid JSON matching this exact structure:
{
  "investigationSummary": "A clear, forensic 2-3 sentence executive summary explaining why the transaction was evaluated as this risk level, citing specific metrics (e.g. amount ratio, location, device, velocity).",
  "primaryRiskFactors": ["Short bullet point 1", "Short bullet point 2", "Short bullet point 3"],
  "supportingEvidence": ["Detailed forensic evidence 1 with specific values", "Detailed forensic evidence 2 with baseline comparison"],
  "confidence": 95,
  "recommendedAction": "Actionable analyst recommendation (e.g. Manual review, Temporary hold, Step-up authentication)"
}`;

      const aiCallPromise = ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction:
            'You are an expert fraud investigation AI assistant in a financial risk management platform. Return concise, highly professional fintech investigation reports in strict JSON format.',
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI inference timeout')), 7000)
      );

      const response: any = await Promise.race([aiCallPromise, timeoutPromise]);

      const text = response.text?.trim() || '';
      const parsed = JSON.parse(text);

      return {
        id: `INV-${tx.id}-${Date.now().toString().slice(-4)}`,
        transactionId: tx.id,
        riskScore: riskAnalysis.finalScore,
        riskLevel: riskAnalysis.riskLevel,
        investigationSummary: parsed.investigationSummary || 'AI investigation completed.',
        primaryRiskFactors: Array.isArray(parsed.primaryRiskFactors) ? parsed.primaryRiskFactors : ['High deviation from historical pattern'],
        supportingEvidence: Array.isArray(parsed.supportingEvidence) ? parsed.supportingEvidence : ['Anomalous transaction attributes detected.'],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 92,
        recommendedAction: parsed.recommendedAction || 'Conduct manual review',
        engineType: 'GEMINI_AI',
        modelUsed: 'gemini-3.7-flash',
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Gemini AI investigation encountered error/timeout, falling back to deterministic engine:', err);
      return this.generateFallbackInvestigation(tx, user, riskAnalysis);
    }
  }
}
