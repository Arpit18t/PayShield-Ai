# PayShield AI - AI Forensic Investigation & Analyst Copilot

## Overview
PayShield AI integrates **Google Gemini 3.7** as an automated forensic investigator and real-time analyst assistant. It automatically synthesizes raw transaction parameters, historical baseline profiles, rule penalties, and ML feature attributions into structured, audit-ready investigation dossiers.

---

## Forensic Dossier Structure

Each AI Investigation report adheres to a strict JSON schema:

```json
{
  "transactionId": "TXN10082",
  "evaluatedAt": "2026-08-25T07:00:00.000Z",
  "engineType": "GEMINI_AI",
  "investigationSummary": "High-risk transaction detected: 14.8x amount spike (₹94,800 vs ₹6,400 baseline) combined with unrecognized hardware in nocturnal window.",
  "primaryRiskFactors": [
    "Severe spending deviation (14.8x baseline average)",
    "Unrecognized hardware fingerprint in late-night hours (02:14 AM)",
    "Merchant category: High-Risk Cryptocurrency Exchange"
  ],
  "supportingEvidence": [
    "User historical avg: ₹6,400 | Current amount: ₹94,800",
    "Known hardware: DEV-99128 | Ingress device: DEV-44810",
    "Velocity: 4 transactions in past 5 minutes"
  ],
  "recommendedAction": "TEMPORARY_HOLD",
  "analystNotes": "Immediate out-of-band phone verification recommended. Block outbound settlements to merchant pending customer confirmation."
}
```

---

## Interactive Analyst Copilot (`AnalystChatAgent`)

Fraud analysts can query the AI Copilot directly within the Transaction Detail view. The agent provides grounded answers with specific transaction citations:
- **"Why was this flagged as high risk?"**
- **"Has this user transacted from this device before?"**
- **"What is the historical average amount for this user?"**
- **"What immediate triage steps should I take?"**

---

## Fallback Resilience Strategy

If the Gemini API key is unavailable, expired, or network-constrained:
1. `GeminiInvestigator` automatically catches the exception.
2. The engine constructs a comprehensive, deterministic forensic report using the evaluated rule triggers and behavioral features.
3. The report is labeled with `engineType: "DETERMINISTIC_FALLBACK"`.
4. The frontend renders the complete investigation card seamlessly without breaking UI layout or erroring out.
