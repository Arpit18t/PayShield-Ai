import { GoogleGenAI } from '@google/genai';
import { Transaction, UserProfile, RiskAnalysis, InvestigationReport } from '../../../shared/types';

export class AnalystChatAgent {
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

  public static async answerQuestion(
    question: string,
    tx: Transaction,
    user: UserProfile | null,
    userHistory: Transaction[],
    riskAnalysis: RiskAnalysis,
    investigation: InvestigationReport | null
  ): Promise<{ answer: string; suggestedQuestions: string[]; evidenceReferences: string[] }> {
    const ai = this.getAIClient();

    // Context preparation
    const baseline = user ? user.historicalAverageAmount : 5000;
    const ratio = (tx.amount / Math.max(1, baseline)).toFixed(2);
    const triggeredRuleNames = riskAnalysis.triggeredRules.map((r) => r.ruleName).join(', ');

    const evidenceRefs = [
      `Amount: ₹${tx.amount.toLocaleString('en-IN')} (${ratio}x avg)`,
      `Device: ${tx.deviceId} (${riskAnalysis.behavioralFeatures.isNewDevice ? 'Unrecognized' : 'Known'})`,
      `Location: ${tx.location} (${riskAnalysis.behavioralFeatures.isLocationChanged ? 'Foreign/Anomalous' : 'Domestic Verified'})`,
      `Risk Score: ${riskAnalysis.finalScore}/100 (${riskAnalysis.riskLevel})`,
      `Deterministic Policy: ${riskAnalysis.decision}`,
    ];

    if (!ai) {
      // Deterministic intelligent answers based on question intent
      const qLower = question.toLowerCase();
      let answer = '';

      if (qLower.includes('why') || qLower.includes('flagged') || qLower.includes('reason')) {
        answer = `Transaction ${tx.id} was flagged with a Risk Score of ${riskAnalysis.finalScore}/100 (${riskAnalysis.riskLevel} Risk) primarily because:\n\n1. **Amount Spike**: The transaction amount of ₹${tx.amount.toLocaleString('en-IN')} is **${ratio}x** higher than the user's historical average of ₹${baseline.toLocaleString('en-IN')}.\n2. **Device Hardware**: Originating hardware ID \`${tx.deviceId}\` is an unverified device never previously seen for this account.\n3. **Location Deviation**: The payment originated from **${tx.location}**, which does not match historical locations.\n4. **Velocity Burst**: ${riskAnalysis.behavioralFeatures.txCountLast5Minutes} transactions detected in the 5-minute activity window.`;
      } else if (qLower.includes('driver') || qLower.includes('factor')) {
        answer = `The top risk drivers for ${tx.id} evaluated by the PayShield engine are:\n- **Rule Score (40% weight)**: ${riskAnalysis.ruleScore}/100 (Triggered rules: ${triggeredRuleNames || 'None'})\n- **Behavior Score (35% weight)**: ${riskAnalysis.behaviorScore}/100 (${ratio}x spending spike)\n- **ML Score (25% weight)**: ${riskAnalysis.mlScore}/100 (High-risk anomaly probability)`;
      } else if (qLower.includes('compare') || qLower.includes('behavior') || qLower.includes('history')) {
        answer = `**Behavioral Comparison for User ${user?.id || tx.userId}**:\n- **Historical Average**: ₹${baseline.toLocaleString('en-IN')} | **Current Transaction**: ₹${tx.amount.toLocaleString('en-IN')} (**${ratio}x spike**)\n- **Usual Device**: \`${user?.usualDevice || 'Standard'}\` | **Current Device**: \`${tx.deviceId}\` (${riskAnalysis.behavioralFeatures.isNewDevice ? 'NEW' : 'MATCH'})\n- **Usual Geolocation**: ${user?.usualLocation || 'Home Region'} | **Current Geolocation**: ${tx.location}\n- **Total Transactions Completed**: ${user?.totalTransactionsCount || 0} lifetime transactions with ${user?.failedTransactionsCountLast30Days || 0} recent failures.`;
      } else if (qLower.includes('action') || qLower.includes('recommend')) {
        answer = `**Recommended Policy & Action**:\n- **Deterministic Decision**: \`${riskAnalysis.decision}\`\n- **Investigation Recommendation**: ${investigation?.recommendedAction || 'Execute manual review'}\n- **Next Step**: Place a temporary hold on settlement and trigger out-of-band biometric authentication challenge to the verified phone number.`;
      } else {
        answer = `**Investigation Summary for ${tx.id}**:\nTransaction of ₹${tx.amount.toLocaleString('en-IN')} on ${new Date(tx.timestamp).toLocaleString()} is classified as **${riskAnalysis.riskLevel} Risk (Score: ${riskAnalysis.finalScore}/100)**. Decision applied: **${riskAnalysis.decision}**. Key anomalies include ${ratio}x amount deviation, new device fingerprint, and foreign geolocation.`;
      }

      return {
        answer,
        suggestedQuestions: [
          'Show me the main risk drivers.',
          "Compare this transaction with the user's recent behavior.",
          'What action do you recommend?',
          'Explain the ML feature weights.',
        ],
        evidenceReferences: evidenceRefs,
      };
    }

    try {
      const systemPrompt = `You are the PayShield AI Risk Analyst Assistant. You help human risk operations analysts investigate flagged transactions.
Be concise, data-driven, forensic, and direct. Use markdown for readability (bullet points, bold highlights).
Never hallucinate non-existent tools or execute destructive modifications. Base your answers strictly on the provided risk context.`;

      const userPrompt = `Analyst Question: "${question}"

Transaction Context:
- ID: ${tx.id}
- User: ${user?.name} (${user?.id})
- Amount: ₹${tx.amount} (Historical Avg: ₹${baseline}, Ratio: ${ratio}x)
- Payment Method: ${tx.paymentMethod}
- Merchant: ${tx.merchant} (${tx.merchantCategory})
- Location: ${tx.location} (User usual: ${user?.usualLocation})
- Device: ${tx.deviceId} (User usual: ${user?.usualDevice}, IsNew: ${riskAnalysis.behavioralFeatures.isNewDevice})
- Timestamp: ${tx.timestamp}

Risk Analysis Context:
- Final Score: ${riskAnalysis.finalScore}/100 (${riskAnalysis.riskLevel})
- Rule Score (40%): ${riskAnalysis.ruleScore}/100
- Behavior Score (35%): ${riskAnalysis.behaviorScore}/100
- ML Score (25%): ${riskAnalysis.mlScore}/100
- Policy Decision: ${riskAnalysis.decision}
- Triggered Rules: ${triggeredRuleNames}
- Velocity (5m): ${riskAnalysis.behavioralFeatures.txCountLast5Minutes} transactions

Please provide a clear, professional analyst answer.`;

      const aiCallPromise = ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI inference timeout')), 7000)
      );

      const response: any = await Promise.race([aiCallPromise, timeoutPromise]);

      const answer = response.text?.trim() || 'AI investigation response received.';

      return {
        answer,
        suggestedQuestions: [
          'Why was this flagged?',
          'Show me the main risk drivers.',
          'Compare with historical baseline.',
          'What action do you recommend?',
        ],
        evidenceReferences: evidenceRefs,
      };
    } catch (err) {
      console.warn('Gemini chat agent fallback triggered:', err);
      return {
        answer: `**Analysis for ${tx.id}**: Evaluated at Risk Score ${riskAnalysis.finalScore}/100 (${riskAnalysis.riskLevel}). Decision is **${riskAnalysis.decision}** due to ${ratio}x amount spike and unverified device signature.`,
        suggestedQuestions: ['Show me the main risk drivers.', 'What action do you recommend?'],
        evidenceReferences: evidenceRefs,
      };
    }
  }
}
