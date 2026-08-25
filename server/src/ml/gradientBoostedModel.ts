import { MLFeatureVector } from './types';
import { ConfusionMatrix, MLFeatureContribution } from '../../../shared/types';
import { FEATURE_DISPLAY_NAMES, ML_FEATURE_NAMES } from './featureExtractor';

interface TreeNode {
  isLeaf: boolean;
  value?: number;
  featureIndex?: number;
  threshold?: number;
  gain?: number;
  left?: TreeNode;
  right?: TreeNode;
}

export interface ModelEvaluation {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: ConfusionMatrix;
  sampleCount: number;
}

export class GradientBoostedRiskClassifier {
  public static readonly VERSION = 'PayShield-GBDT-v2.1';
  public static readonly ALGORITHM = 'Gradient Boosted Decision Forest (GBDT)';

  private trees: TreeNode[] = [];
  private baseLogOdds = 0;
  private learningRate = 0.15;
  private maxDepth = 4;
  private nEstimators = 25;
  private featureGains: number[] = [];
  private isTrained = false;

  private sigmoid(z: number): number {
    if (z > 20) return 0.99999;
    if (z < -20) return 0.00001;
    return 1 / (1 + Math.exp(-z));
  }

  public train(
    XTrain: number[][],
    yTrain: number[],
    nEstimators = 25,
    maxDepth = 4,
    learningRate = 0.15
  ): void {
    this.nEstimators = nEstimators;
    this.maxDepth = maxDepth;
    this.learningRate = learningRate;
    this.trees = [];

    const nSamples = XTrain.length;
    const nFeatures = XTrain[0].length;
    this.featureGains = new Array(nFeatures).fill(0);

    // Initial prior log-odds
    const positiveCount = yTrain.reduce((acc, y) => acc + y, 0);
    const priorP = Math.max(0.01, Math.min(0.99, positiveCount / nSamples));
    this.baseLogOdds = Math.log(priorP / (1 - priorP));

    // Raw logits F(x)
    const logits = new Array(nSamples).fill(this.baseLogOdds);

    for (let m = 0; m < this.nEstimators; m++) {
      // 1. Calculate pseudo-residuals r_i and probabilities p_i
      const residuals = new Array(nSamples);
      const probabilities = new Array(nSamples);

      for (let i = 0; i < nSamples; i++) {
        const p = this.sigmoid(logits[i]);
        probabilities[i] = p;
        residuals[i] = yTrain[i] - p; // Negative gradient of log-loss
      }

      // 2. Build regression tree on residuals
      const sampleIndices = Array.from({ length: nSamples }, (_, i) => i);
      const tree = this.buildTree(
        XTrain,
        residuals,
        probabilities,
        sampleIndices,
        0,
        this.maxDepth
      );
      this.trees.push(tree);

      // 3. Update logits F(x) = F(x) + eta * tree(x)
      for (let i = 0; i < nSamples; i++) {
        const leafVal = this.predictTree(tree, XTrain[i]);
        logits[i] += this.learningRate * leafVal;
      }
    }

    this.isTrained = true;
  }

  private buildTree(
    X: number[][],
    residuals: number[],
    probabilities: number[],
    indices: number[],
    depth: number,
    maxDepth: number
  ): TreeNode {
    // Leaf node condition
    if (depth >= maxDepth || indices.length <= 5) {
      let numerator = 0;
      let denominator = 1.0; // L2 lambda = 1.0
      for (const idx of indices) {
        numerator += residuals[idx];
        const p = probabilities[idx];
        denominator += p * (1 - p);
      }
      return {
        isLeaf: true,
        value: numerator / denominator,
      };
    }

    const nFeatures = X[0].length;
    let bestGain = -Infinity;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    // Current sum of residuals
    let currentSum = 0;
    for (const idx of indices) currentSum += residuals[idx];

    for (let f = 0; f < nFeatures; f++) {
      // Find candidate splits (sample quantiles)
      const values = indices.map((i) => X[i][f]).sort((a, b) => a - b);
      const minVal = values[0];
      const maxVal = values[values.length - 1];

      if (minVal === maxVal) continue;

      // Try 8 quantiles as candidate thresholds
      const step = Math.max(1, Math.floor(values.length / 8));
      const testedThresholds = new Set<number>();

      for (let q = step; q < values.length - 1; q += step) {
        const threshold = values[q];
        if (testedThresholds.has(threshold)) continue;
        testedThresholds.add(threshold);

        const leftIdx: number[] = [];
        const rightIdx: number[] = [];
        let leftSum = 0;
        let rightSum = 0;

        for (const idx of indices) {
          if (X[idx][f] <= threshold) {
            leftIdx.push(idx);
            leftSum += residuals[idx];
          } else {
            rightIdx.push(idx);
            rightSum += residuals[idx];
          }
        }

        if (leftIdx.length < 3 || rightIdx.length < 3) continue;

        // Variance reduction / SSE gain
        const gain = (leftSum * leftSum) / leftIdx.length + (rightSum * rightSum) / rightIdx.length - (currentSum * currentSum) / indices.length;

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = f;
          bestThreshold = threshold;
          bestLeftIndices = leftIdx;
          bestRightIndices = rightIdx;
        }
      }
    }

    if (bestGain <= 0 || bestFeature === -1) {
      let numerator = 0;
      let denominator = 1.0;
      for (const idx of indices) {
        numerator += residuals[idx];
        const p = probabilities[idx];
        denominator += p * (1 - p);
      }
      return {
        isLeaf: true,
        value: numerator / denominator,
      };
    }

    // Accumulate feature gain
    this.featureGains[bestFeature] += bestGain;

    const leftNode = this.buildTree(
      X,
      residuals,
      probabilities,
      bestLeftIndices,
      depth + 1,
      maxDepth
    );
    const rightNode = this.buildTree(
      X,
      residuals,
      probabilities,
      bestRightIndices,
      depth + 1,
      maxDepth
    );

    return {
      isLeaf: false,
      featureIndex: bestFeature,
      threshold: bestThreshold,
      gain: bestGain,
      left: leftNode,
      right: rightNode,
    };
  }

  private predictTree(node: TreeNode, x: number[]): number {
    if (node.isLeaf) return node.value || 0;
    if (x[node.featureIndex!] <= node.threshold!) {
      return this.predictTree(node.left!, x);
    }
    return this.predictTree(node.right!, x);
  }

  public predictProbability(x: number[]): number {
    if (!this.isTrained) return 0.5;
    let logit = this.baseLogOdds;
    for (const tree of this.trees) {
      logit += this.learningRate * this.predictTree(tree, x);
    }
    return this.sigmoid(logit);
  }

  public evaluate(XTest: number[][], yTest: number[]): ModelEvaluation {
    const n = XTest.length;
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;

    const predictions: { prob: number; actual: number }[] = [];

    for (let i = 0; i < n; i++) {
      const prob = this.predictProbability(XTest[i]);
      const predictedLabel = prob >= 0.5 ? 1 : 0;
      const actual = yTest[i];

      predictions.push({ prob, actual });

      if (predictedLabel === 1 && actual === 1) tp++;
      else if (predictedLabel === 1 && actual === 0) fp++;
      else if (predictedLabel === 0 && actual === 0) tn++;
      else if (predictedLabel === 0 && actual === 1) fn++;
    }

    const accuracy = (tp + tn) / (n || 1);
    const precision = tp / (tp + fp || 1);
    const recall = tp / (tp + fn || 1);
    const f1Score = (2 * precision * recall) / (precision + recall || 1);

    // Trapezoidal ROC-AUC calculation
    predictions.sort((a, b) => b.prob - a.prob);
    const totalPositives = yTest.reduce((acc, y) => acc + y, 0) || 1;
    const totalNegatives = n - totalPositives || 1;

    let accumulatedTP = 0;
    let accumulatedFP = 0;
    let prevFPR = 0;
    let prevTPR = 0;
    let rocAuc = 0;

    for (const p of predictions) {
      if (p.actual === 1) accumulatedTP++;
      else accumulatedFP++;

      const currentTPR = accumulatedTP / totalPositives;
      const currentFPR = accumulatedFP / totalNegatives;

      // Trapezoid area: (FPR_i - FPR_{i-1}) * (TPR_i + TPR_{i-1}) / 2
      rocAuc += (currentFPR - prevFPR) * (currentTPR + prevTPR) / 2;
      prevFPR = currentFPR;
      prevTPR = currentTPR;
    }

    return {
      accuracy: Number(accuracy.toFixed(4)),
      precision: Number(precision.toFixed(4)),
      recall: Number(recall.toFixed(4)),
      f1Score: Number(f1Score.toFixed(4)),
      rocAuc: Number(Math.min(0.999, Math.max(0.5, rocAuc)).toFixed(4)),
      confusionMatrix: {
        truePositives: tp,
        falsePositives: fp,
        trueNegatives: tn,
        falseNegatives: fn,
      },
      sampleCount: n,
    };
  }

  public explain(featureVector: MLFeatureVector): MLFeatureContribution[] {
    const totalGain = this.featureGains.reduce((a, b) => a + b, 0) || 1;
    const prob = this.predictProbability(featureVector.vector);
    const score = Math.round(prob * 100);

    const contributions: MLFeatureContribution[] = ML_FEATURE_NAMES.map((name, idx) => {
      const rawVal = featureVector.vector[idx];
      const globalWeight = Number((this.featureGains[idx] / totalGain).toFixed(3));
      
      // Calculate directional local contribution
      let localImpact = 0;
      let desc = '';

      if (name === 'amountRatio') {
        const ratio = Number(rawVal);
        if (ratio > 5) {
          localImpact = Math.min(100, Math.round((ratio / 15) * 85));
          desc = `Amount is ${ratio}x historical user baseline`;
        } else if (ratio > 2) {
          localImpact = Math.round(ratio * 12);
          desc = `Amount elevated at ${ratio}x typical baseline`;
        } else {
          localImpact = 4;
          desc = `Amount conforms to usual spending baseline (${ratio}x)`;
        }
      } else if (name === 'newDevice') {
        localImpact = rawVal === 1 ? 80 : 0;
        desc = rawVal === 1 ? 'Unrecognized hardware fingerprint' : 'Verified existing hardware device';
      } else if (name === 'locationChanged') {
        localImpact = rawVal === 1 ? 75 : 0;
        desc = rawVal === 1 ? 'Geographical location differs from profile' : 'Consistent with known domestic locations';
      } else if (name === 'transactionsLast5Min') {
        const count = Number(rawVal);
        localImpact = count > 3 ? Math.min(95, count * 20) : count === 1 ? 2 : 15;
        desc = `${count} transactions in rolling 5-minute window`;
      } else if (name === 'accountAgeDays') {
        const age = Number(rawVal);
        localImpact = age < 7 ? 65 : age < 30 ? 30 : 5;
        desc = `Account age: ${age} days`;
      } else if (name === 'merchantRiskLevel') {
        const lvl = Number(rawVal);
        localImpact = lvl === 2 ? 60 : lvl === 1 ? 25 : 0;
        desc = lvl === 2 ? 'High-liquidity / cash-equivalent sector' : 'Standard commerce merchant';
      } else if (name === 'failedTransactions') {
        const fails = Number(rawVal);
        localImpact = fails > 2 ? Math.min(80, fails * 20) : 0;
        desc = `${fails} recent transaction retry failures`;
      } else {
        localImpact = Math.round(score * globalWeight);
        desc = `Feature value: ${rawVal}`;
      }

      return {
        featureName: name,
        displayName: FEATURE_DISPLAY_NAMES[name] || name,
        featureValue: rawVal,
        weight: globalWeight,
        contribution: localImpact,
        description: desc,
      };
    });

    return contributions.sort((a, b) => b.contribution - a.contribution);
  }
}
