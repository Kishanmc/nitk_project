import Papa from 'papaparse';

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleaned = results.data.filter((row) =>
          Object.values(row).some((v) => v !== null && v !== undefined && v !== '')
        );
        resolve(cleaned);
      },
      error: (err) => reject(err),
    });
  });
}

export function getColumnNames(data) {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]);
}

export function getSensorColumns(columns) {
  const sensorMap = {};
  const sensorPrefixes = ['S1', 'S2', 'S3', 'S4', 'Sensor1', 'Sensor2', 'Sensor3', 'Sensor4'];

  for (let i = 1; i <= 4; i++) {
    sensorMap[i] = { accel: { x: null, y: null, z: null }, gyro: { x: null, y: null, z: null } };
  }

  columns.forEach((col) => {
    const lower = col.toLowerCase();
    for (let i = 1; i <= 4; i++) {
      const patterns = [`s${i}`, `sensor${i}`, `sensor_${i}`, `mpu${i}`];
      if (patterns.some((p) => lower.includes(p))) {
        if (lower.includes('acc')) {
          if (lower.includes('x')) sensorMap[i].accel.x = col;
          else if (lower.includes('y')) sensorMap[i].accel.y = col;
          else if (lower.includes('z')) sensorMap[i].accel.z = col;
        } else if (lower.includes('gyr') || lower.includes('gyro')) {
          if (lower.includes('x')) sensorMap[i].gyro.x = col;
          else if (lower.includes('y')) sensorMap[i].gyro.y = col;
          else if (lower.includes('z')) sensorMap[i].gyro.z = col;
        }
      }
    }
  });

  return sensorMap;
}

export function autoDetectColumns(columns) {
  const ts = columns.find(
    (c) => c.toLowerCase().includes('time') || c.toLowerCase().includes('timestamp') || c.toLowerCase() === 't'
  );

  const accelCols = columns.filter(
    (c) => c.toLowerCase().includes('acc') && !c.toLowerCase().includes('mag')
  );
  const gyroCols = columns.filter(
    (c) => c.toLowerCase().includes('gyr') || c.toLowerCase().includes('gyro')
  );

  return { timestamp: ts || columns[0], accelCols, gyroCols, allColumns: columns };
}

export function extractTimestamps(data, tsColumn) {
  return data.map((row) => {
    const val = row[tsColumn];
    if (typeof val === 'number') return val;
    return parseFloat(val) || 0;
  });
}
