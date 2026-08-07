// =============================================================================
// IceStream — API Client Service
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend API offline. Operating in local frontend simulation mode.", err);
    return null;
  }
}

export async function fetchServiceStatuses() {
  try {
    const res = await fetch(`${API_BASE_URL}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchEvents(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.limit) query.append("limit", params.limit);
    if (params.status && params.status !== "all") query.append("status", params.status);
    if (params.topic) query.append("topic", params.topic);

    const res = await fetch(`${API_BASE_URL}/events?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchThroughput(points = 30) {
  try {
    const res = await fetch(`${API_BASE_URL}/throughput?points=${points}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchValidationMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/validation`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchSystemAlerts() {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchObservabilityStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/observability/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function resetQuarantine() {
  try {
    const res = await fetch(`${API_BASE_URL}/observability/reset`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function injectAnomaly(anomalyType) {
  try {
    const res = await fetch(`${API_BASE_URL}/anomaly/inject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anomaly_type: anomalyType }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchQuarantinedRecords() {
  try {
    const res = await fetch(`${API_BASE_URL}/quarantine`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchIcebergSnapshots() {
  try {
    const res = await fetch(`${API_BASE_URL}/iceberg/snapshots`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function executeIcebergTimeTravel(snapshotId = null) {
  try {
    const query = snapshotId ? `?snapshot_id=${snapshotId}` : "";
    const res = await fetch(`${API_BASE_URL}/iceberg/time-travel${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}
