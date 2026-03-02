export function movingAverage(data, windowSize = 5) {
  if (!data || data.length === 0) return [];
  const result = [];
  const half = Math.floor(windowSize / 2);
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(data.length - 1, i + half); j++) {
      sum += data[j];
      count++;
    }
    result.push(sum / count);
  }
  return result;
}

export function kalmanFilter(data, processNoise = 0.01, measurementNoise = 0.1) {
  if (!data || data.length === 0) return [];

  let estimate = data[0];
  let errorEstimate = 1;
  const result = [estimate];

  for (let i = 1; i < data.length; i++) {
    const prediction = estimate;
    const predictionError = errorEstimate + processNoise;
    const kalmanGain = predictionError / (predictionError + measurementNoise);
    estimate = prediction + kalmanGain * (data[i] - prediction);
    errorEstimate = (1 - kalmanGain) * predictionError;
    result.push(estimate);
  }

  return result;
}

export function applyFilter(data, filterType, key) {
  const values = data.map((d) => d[key] ?? 0);
  let filtered;

  switch (filterType) {
    case 'moving_avg':
      filtered = movingAverage(values, 7);
      break;
    case 'kalman':
      filtered = kalmanFilter(values);
      break;
    default:
      return data;
  }

  return data.map((d, i) => ({
    ...d,
    [key]: parseFloat(filtered[i].toFixed(4)),
  }));
}

export function applyFilterToMultipleKeys(data, filterType, keys) {
  let result = [...data.map((d) => ({ ...d }))];
  keys.forEach((key) => {
    const values = result.map((d) => d[key] ?? 0);
    let filtered;
    switch (filterType) {
      case 'moving_avg':
        filtered = movingAverage(values, 7);
        break;
      case 'kalman':
        filtered = kalmanFilter(values);
        break;
      default:
        return;
    }
    result = result.map((d, i) => ({
      ...d,
      [key]: parseFloat(filtered[i].toFixed(4)),
    }));
  });
  return result;
}
