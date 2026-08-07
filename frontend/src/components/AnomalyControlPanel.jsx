import React, { useState } from "react";
import { AlertOctagon, RotateCcw, Zap, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";
import { injectAnomaly, resetQuarantine } from "../api/client";

export default function AnomalyControlPanel({ quarantineState = {}, onStateChange }) {
  const [loading, setLoading] = useState(false);
  const [actionLog, setActionLog] = useState(null);

  const isQuarantined = !!quarantineState.quarantineActive;
  const taxNullRatio = quarantineState.taxNullRatio || 0;

  async function handleInjectTaxAnomaly() {
    setLoading(true);
    setActionLog("Injecting 15 events with 100% NULL Tax Amount...");
    const res = await injectAnomaly("tax_null_spike");
    setLoading(false);
    if (res) {
      setActionLog(`🚨 Anomaly Triggered! Reason: ${res.reason}`);
      if (onStateChange) onStateChange();
    }
  }

  async function handleInjectSchemaDrift() {
    setLoading(true);
    setActionLog("Injecting malformed payload missing mandatory checkout keys...");
    const res = await injectAnomaly("schema_drift");
    setLoading(false);
    if (res) {
      setActionLog(`🚨 Schema Drift Anomaly Triggered! Reason: ${res.reason}`);
      if (onStateChange) onStateChange();
    }
  }

  async function handleReset() {
    setLoading(true);
    setActionLog("Clearing quarantine gate & triggering automated re-fetch...");
    const res = await resetQuarantine();
    setLoading(false);
    if (res) {
      setActionLog("✅ Quarantine cleared. Analytical pipeline resumed.");
      if (onStateChange) onStateChange();
    }
  }

  return (
    <div className={`card anomaly-control-card ${isQuarantined ? "quarantine-alert-active" : ""}`}>
      <div className="card-header">
        <div className="card-title">
          <ShieldAlert size={16} /> Real-Time Observability & Automated Quarantine Control
        </div>
        <div className="card-badge">
          {isQuarantined ? (
            <span className="badge-status error"><AlertOctagon size={12} /> QUARANTINE ENGAGED</span>
          ) : (
            <span className="badge-status success"><CheckCircle size={12} /> ALL RULES PASSING</span>
          )}
        </div>
      </div>

      <div className="anomaly-control-grid">
        {/* Left: Interactive Control Actions */}
        <div className="anomaly-actions">
          <div className="anomaly-actions-title">Interactive Anomaly Injection (Simulate Faults):</div>
          <div className="anomaly-btn-group">
            <button
              className="btn-anomaly btn-danger"
              onClick={handleInjectTaxAnomaly}
              disabled={loading || isQuarantined}
              title="Inject 50% NULL Tax Amount to trigger automated Flink quarantine"
            >
              <Zap size={14} /> Inject 50% NULL Tax Anomaly
            </button>

            <button
              className="btn-anomaly btn-warning"
              onClick={handleInjectSchemaDrift}
              disabled={loading || isQuarantined}
              title="Inject malformed payload to trigger schema drift quarantine"
            >
              <AlertOctagon size={14} /> Inject Schema Drift Anomaly
            </button>

            <button
              className="btn-anomaly btn-success"
              onClick={handleReset}
              disabled={loading || !isQuarantined}
              title="Reset Quarantine & Resume Downstream Ingestion"
            >
              <RotateCcw size={14} /> Reset & Auto-Refetch
            </button>
          </div>
        </div>

        {/* Right: Real-time Metric Indicators */}
        <div className="anomaly-stats">
          <div className="stat-pill">
            <div className="stat-pill-label">Tax Amount Null Ratio</div>
            <div className={`stat-pill-value ${taxNullRatio >= 50 ? "text-danger" : "text-success"}`}>
              {taxNullRatio}% <span className="stat-sub">/ 50.0% Max Limit</span>
            </div>
            <div className="stat-progress-bar">
              <div
                className={`stat-progress-fill ${taxNullRatio >= 50 ? "bg-danger" : "bg-success"}`}
                style={{ width: `${Math.min(taxNullRatio, 100)}%` }}
              />
            </div>
          </div>

          <div className="stat-pill">
            <div className="stat-pill-label">Auto-Refetch Action Count</div>
            <div className="stat-pill-value text-primary">
              {quarantineState.refetchCount || 0} <span className="stat-sub">Zero-Human Triggers</span>
            </div>
          </div>
        </div>
      </div>

      {actionLog && (
        <div className="anomaly-action-log">
          <RefreshCw size={12} className={loading ? "spin-icon" : ""} /> {actionLog}
        </div>
      )}
    </div>
  );
}
