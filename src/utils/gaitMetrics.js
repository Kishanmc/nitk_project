export function calculateMagnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

export function addMagnitudeColumn(data, xCol, yCol, zCol, outputCol = 'magnitude') {
  return data.map((row) => ({
    ...row,
    [outputCol]: parseFloat(
      calculateMagnitude(row[xCol] ?? 0, row[yCol] ?? 0, row[zCol] ?? 0).toFixed(4)
    ),
  }));
}

export function detectSteps(magnitudeData, sampleRate = 60, threshold = null, minGapMs = 200) {
  if (!magnitudeData || magnitudeData.length < 3) return { steps: [], count: 0 };

  if (threshold === null) {
    const mean = magnitudeData.reduce((s, v) => s + v, 0) / magnitudeData.length;
    const stdDev = Math.sqrt(
      magnitudeData.reduce((s, v) => s + (v - mean) ** 2, 0) / magnitudeData.length
    );
    threshold = mean + 0.8 * stdDev;
  }

  const minGapSamples = Math.floor((minGapMs / 1000) * sampleRate);
  const steps = [];
  let lastStepIdx = -minGapSamples;

  for (let i = 1; i < magnitudeData.length - 1; i++) {
    if (
      magnitudeData[i] > magnitudeData[i - 1] &&
      magnitudeData[i] > magnitudeData[i + 1] &&
      magnitudeData[i] > threshold &&
      i - lastStepIdx >= minGapSamples
    ) {
      steps.push({ index: i, value: magnitudeData[i] });
      lastStepIdx = i;
    }
  }

  return { steps, count: steps.length };
}

export function calculateCadence(stepCount, totalSamples, sampleRate = 60) {
  const totalTimeSeconds = totalSamples / sampleRate;
  const totalTimeMinutes = totalTimeSeconds / 60;
  if (totalTimeMinutes === 0) return 0;
  return parseFloat((stepCount / totalTimeMinutes).toFixed(1));
}

export function calculateStrideIntervals(steps, sampleRate = 60) {
  if (steps.length < 2) return { intervals: [], mean: 0, stdDev: 0 };

  const intervals = [];
  for (let i = 1; i < steps.length; i++) {
    const dt = (steps[i].index - steps[i - 1].index) / sampleRate;
    intervals.push(parseFloat(dt.toFixed(4)));
  }

  const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  const variance = intervals.reduce((s, v) => s + (v - mean) ** 2, 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  return {
    intervals,
    mean: parseFloat(mean.toFixed(4)),
    stdDev: parseFloat(stdDev.toFixed(4)),
  };
}

export function calculateSymmetryIndex(leftSteps, rightSteps) {
  if (leftSteps === 0 && rightSteps === 0) return 100;
  const larger = Math.max(leftSteps, rightSteps);
  const smaller = Math.min(leftSteps, rightSteps);
  if (larger === 0) return 0;
  return parseFloat(((smaller / larger) * 100).toFixed(1));
}

export function computeGaitMetrics(data, accelXCol, accelYCol, accelZCol, sampleRate = 60) {
  const magnitudes = data.map((row) =>
    calculateMagnitude(row[accelXCol] ?? 0, row[accelYCol] ?? 0, row[accelZCol] ?? 0)
  );

  const { steps, count } = detectSteps(magnitudes, sampleRate);
  const cadence = calculateCadence(count, data.length, sampleRate);
  const stride = calculateStrideIntervals(steps, sampleRate);

  const halfLen = Math.floor(data.length / 2);
  const mag1 = magnitudes.slice(0, halfLen);
  const mag2 = magnitudes.slice(halfLen);
  const { count: cnt1 } = detectSteps(mag1, sampleRate);
  const { count: cnt2 } = detectSteps(mag2, sampleRate);
  const symmetryIndex = calculateSymmetryIndex(cnt1, cnt2);

  return {
    stepCount: count,
    cadence,
    strideMean: stride.mean,
    strideStdDev: stride.stdDev,
    strideIntervals: stride.intervals,
    symmetryIndex,
    steps,
    magnitudes,
  };
}
