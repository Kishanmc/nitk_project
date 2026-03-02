import { useState, useMemo, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import SensorChart from '../components/SensorChart';
import MetricsPanel from '../components/MetricsPanel';
import FilterControls from '../components/FilterControls';
import { parseCSV, autoDetectColumns } from '../utils/csvParser';
import { applyFilterToMultipleKeys } from '../utils/filters';
import { computeGaitMetrics, addMagnitudeColumn } from '../utils/gaitMetrics';
import { apiUploadCSV, apiGetSessions, apiSaveMetrics, apiGetSession } from '../utils/api';

export default function DoctorDashboard() {
  const [rawData, setRawData] = useState(null);
  const [columns, setColumns] = useState(null);
  const [filter, setFilter] = useState('raw');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    apiGetSessions().then((res) => setSessions(res.sessions)).catch(() => {});
  }, []);

  const handleFile = async (file) => {
    setLoading(true);
    try {
      const uploadResult = await apiUploadCSV(file);
      setSessionId(uploadResult.sessionId);

      const data = await parseCSV(file);
      const cols = autoDetectColumns(Object.keys(data[0]));
      setRawData(data);
      setColumns(cols);

      apiGetSessions().then((res) => setSessions(res.sessions)).catch(() => {});
    } catch (err) {
      console.error('CSV parse error:', err);
    }
    setLoading(false);
  };

  const loadSession = async (id) => {
    setLoading(true);
    try {
      const res = await apiGetSession(id);
      const cols = autoDetectColumns(Object.keys(res.data[0]));
      setRawData(res.data);
      setColumns(cols);
      setSessionId(id);
    } catch (err) {
      console.error('Failed to load session:', err);
    }
    setLoading(false);
  };

  const processedData = useMemo(() => {
    if (!rawData || !columns) return null;

    const accelCols = columns.accelCols;
    const gyroCols = columns.gyroCols;
    const allSignalKeys = [...accelCols, ...gyroCols];

    let data = rawData.map((row, i) => ({ ...row, index: i }));

    if (accelCols.length >= 3) {
      data = addMagnitudeColumn(data, accelCols[0], accelCols[1], accelCols[2], 'accel_magnitude');
    }

    if (gyroCols.length >= 3) {
      data = addMagnitudeColumn(data, gyroCols[0], gyroCols[1], gyroCols[2], 'gyro_magnitude');
    }

    let filtered = data;
    if (filter !== 'raw') {
      const keysToFilter = [...allSignalKeys];
      if (accelCols.length >= 3) keysToFilter.push('accel_magnitude');
      if (gyroCols.length >= 3) keysToFilter.push('gyro_magnitude');
      filtered = applyFilterToMultipleKeys(data, filter, keysToFilter);
    }

    let metrics = null;
    if (accelCols.length >= 3) {
      metrics = computeGaitMetrics(filtered, accelCols[0], accelCols[1], accelCols[2]);
    }

    if (metrics && sessionId) {
      apiSaveMetrics(sessionId, {
        stepCount: metrics.stepCount,
        cadence: metrics.cadence,
        strideMean: metrics.strideMean,
        strideStdDev: metrics.strideStdDev,
        symmetryIndex: metrics.symmetryIndex,
      }).catch(() => {});
    }

    return { data: filtered, metrics, accelCols, gyroCols };
  }, [rawData, columns, filter, sessionId]);

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar role="doctor" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Doctor Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">Comprehensive gait signal analysis</p>
            </div>
            {rawData && <FilterControls activeFilter={filter} onFilterChange={setFilter} accentColor="doctor" />}
          </div>

          {!rawData && sessions.length > 0 && (
            <div className="bg-dark-800 border border-dark-600 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Previous Sessions</h3>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => loadSession(s.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors text-left"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{s.filename}</p>
                      <p className="text-gray-500 text-xs">{s.sample_count} samples &middot; {s.duration_sec}s</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(s.uploaded_at).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!rawData && <FileUpload onFileLoaded={handleFile} accentColor="doctor" />}

          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-doctor border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 mt-3">Processing sensor data...</p>
            </div>
          )}

          {processedData && (
            <>
              <MetricsPanel metrics={processedData.metrics} accentColor="doctor" />

              {processedData.accelCols.length > 0 && (
                <SensorChart
                  data={processedData.data}
                  dataKeys={processedData.accelCols}
                  title="Acceleration (X, Y, Z)"
                  syncId="doctor"
                />
              )}

              {processedData.gyroCols.length > 0 && (
                <SensorChart
                  data={processedData.data}
                  dataKeys={processedData.gyroCols}
                  title="Gyroscope (X, Y, Z)"
                  syncId="doctor"
                />
              )}

              {processedData.data[0]?.accel_magnitude !== undefined && (
                <SensorChart
                  data={processedData.data}
                  dataKeys={['accel_magnitude']}
                  title="Acceleration Magnitude"
                  stepMarkers={processedData.metrics?.steps || []}
                  syncId="doctor"
                />
              )}

              {processedData.data[0]?.gyro_magnitude !== undefined && (
                <SensorChart
                  data={processedData.data}
                  dataKeys={['gyro_magnitude']}
                  title="Gyroscope Magnitude"
                  syncId="doctor"
                />
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setRawData(null);
                    setColumns(null);
                    setFilter('raw');
                  }}
                  className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 text-sm transition-colors"
                >
                  Upload New File
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
