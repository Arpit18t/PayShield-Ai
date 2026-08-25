# PayShield AI - Risk Scoring & Decision Engine

## Scoring Formula & Weight Allocation

PayShield AI calculates an audited Composite Risk Score on a normalized scale from **0 to 100**:

$$\text{Final Risk Score} = (0.40 \times \text{Rule Score}) + (0.35 \times \text{Behavioral Score}) + (0.25 \times \text{ML Score})$$

### Risk Tier Boundaries
- **LOW Risk**: 0 – 30 points (Green / Emerald)
- **MEDIUM Risk**: 31 – 70 points (Amber / Yellow)
- **HIGH / CRITICAL Risk**: 71 – 100 points (Rose / Red)

---

## 1. Deterministic Rule Engine (40% Weight)

The Rule Engine evaluates a transparent set of deterministic risk policies. Each triggered rule adds explicit penalty points:

| Rule Code | Rule Description | Threshold Trigger | Penalty Points |
| :--- | :--- | :--- | :--- |
| **R001** | Extreme Amount Spike | $\text{Amount} \ge 5.0 \times \text{User Baseline}$ | +35 pts |
| **R002** | Rapid Transaction Velocity | $\ge 3 \text{ txs in 5 min}$ or $\ge 5 \text{ txs in 1 hour}$ | +30 pts |
| **R003** | Unrecognized Hardware High Value | New Device $\land \text{Amount} > \text{₹}25,000$ | +25 pts |
| **R004** | Cross-Border / Impossible Location | Geolocation delta $\ne \text{Usual Location}$ | +35 pts |
| **R005** | Nocturnal High-Risk Window | Initiated between 00:00 and 05:00 hrs | +15 pts |
| **R006** | Recent Authorization Failures | $\ge 2 \text{ failed attempts in past 30 days}$ | +20 pts |
| **R007** | High-Risk Merchant Category | Crypto Exchange, Bullion, or Digital Vouchers | +20 pts |

---

## 2. Behavioral Anomaly Engine (35% Weight)

The Behavioral Anomaly Engine measures the dynamic statistical distance between the current transaction and the cardholder's baseline:
- **Amount Anomaly Ratio**: $\frac{\text{Current Transaction Amount}}{\max(1, \text{Historical 30-Day Moving Average})}$
- **Velocity Density**: Count of transactions in 5-minute and 1-hour rolling windows.
- **Hardware Profile Match**: Compares hardware fingerprint against user's primary device hash (+25 pts if new).
- **Location Displacement**: Compares ingress IP geolocation against user's registered home city (+25 pts if mismatched).
- **Recent Failure Correlation**: Weighted penalty based on prior transaction declines.

---

## 3. Machine Learning Risk Model (25% Weight)

The ML classifier uses a **Gradient Boosted Decision Tree (GBDT)** architecture:
- Computes non-linear feature interactions across 15 engineered variables.
- Produces a calibrated risk probability $P(\text{Risky}) \in [0, 1]$.
- Scales the probability to an ML Risk Score: $\text{ML Score} = \text{round}(P(\text{Risky}) \times 100)$.
- Computes top predictive feature importances for explainability (XAI).

---

## 4. Policy Decision Matrix

| Risk Tier | Score Range | Default Action | Routing Description |
| :--- | :--- | :--- | :--- |
| **LOW** | 0 – 30 | `ALLOW` | Auto-approved through standard straight-through processing. |
| **MEDIUM** | 31 – 70 | `STEP_UP_VERIFICATION` | Challenge with secondary 2FA / biometric OTP verification. |
| **HIGH (Review)** | 71 – 84 | `MANUAL_REVIEW` | Routed to Level 2 fraud triage queue with automated alert. |
| **CRITICAL (Hold)** | 85 – 100 | `TEMPORARY_HOLD` | Execution paused; immediate cardholder contact required. |
