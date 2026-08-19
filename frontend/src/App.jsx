import { useState, useEffect } from "react";
import {
  Snowflake,
  Clock,
  Bell,
  Pause,
  Play,
  RotateCw,
  Database,
  Key,
  CheckCircle2,
} from "lucide-react";
import { serviceStatuses, systemAlerts, generateRecentEvents } from "./data/dummyData";
import {
  fetchEvents,
  fetchServiceStatuses,
  fetchHealth,
  fetchObservabilityStatus,
} from "./api/client";
import StatusCard from "./components/StatusCard";
import LiveEventCounter from "./components/LiveEventCounter";
import ThroughputChart from "./components/ThroughputChart";
import ValidationMetrics from "./components/ValidationMetrics";
import RecentEventsTable from "./components/RecentEventsTable";
import DataLineageDag from "./components/DataLineageDag";
import AnomalyControlPanel from "./components/AnomalyControlPanel";
import IcebergTimeTravel from "./components/IcebergTimeTravel";

function SettingsModal({ isOpen, onClose, onSaveToast }) {
  const [apiKey, setApiKey] = useState("");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          background: "#0b1120",
          border: "1px solid rgba(255,255,255,.12)",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 25px 80px rgba(0,0,0,.45)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Integration Settings</div>
            <div style={{ opacity: 0.6, fontSize: 13, marginTop: 4 }}>API keys and dashboard connections</div>
          </div>
          <button className="btn-header-action" onClick={onClose}>Close</button>
        </div>

        <label style={{ display: "block", fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
          API Key
        </label>
        <input
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key"
          type="password"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.12)",
            background: "#111827",
            color: "inherit",
            outline: "none",
            marginBottom: 14,
          }}
        />

        <button
          className="btn-header-action btn-settings-icon"
          onClick={() => {
            onSaveToast("Settings saved.");
            onClose();
          }}
        >
          <Key size={14} className="text-cyan" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}

function App() {
  const [clock, setClock] = useState(formatClock());
  const [isLive, setIsLive] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [events, setEvents] = useState(() => generateRecentEvents(20));
  const [statuses, setStatuses] = useState(serviceStatuses);
  const [backendConnected, setBackendConnected] = useState(false);
  const [quarantineState, setQuarantineState] = useState({
    quarantineActive: false,
    taxNullRatio: 0,
    refetchCount: 0,
    totalQuarantinedRecords: 0,
  });
  const [timeRange, setTimeRange] = useState("30m");

  function formatClock() {
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  useEffect(() => {
    const id = setInterval(() => setClock(formatClock()), 1000);
    return () => clearInterval(id);
  }, []);

  async function refreshObservabilityState() {
    const health = await fetchHealth();
    if (health && health.status === "healthy") {
      setBackendConnected(true);
      const obs = await fetchObservabilityStatus();
      if (obs) setQuarantineState(obs);
      const liveEvents = await fetchEvents({ limit: 25 });
      if (liveEvents && liveEvents.length > 0) setEvents(liveEvents);
      const liveStatuses = await fetchServiceStatuses();
      if (liveStatuses) setStatuses(liveStatuses);
    } else {
      setBackendConnected(false);
    }
  }

  useEffect(() => {
    refreshObservabilityState();
  }, []);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(async () => {
      if (backendConnected) {
        const obs = await fetchObservabilityStatus();
        if (obs) setQuarantineState(obs);

        const liveEvents = await fetchEvents({ limit: 25 });
        if (liveEvents && liveEvents.length > 0) {
          setEvents(liveEvents);
          return;
        }
      }

      setEvents((prev) => {
        const newEvents = generateRecentEvents(1);
        return [newEvents[0], ...prev.slice(0, 24)];
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isLive, backendConnected]);

  function handleRefresh() {
    refreshObservabilityState();
    showToast("Dashboard data refreshed.");
  }

  return (
    <div className="dashboard">
      {toastMessage && (
        <div className="toast-notification animate-in">
          <CheckCircle2 size={16} className="text-green" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-brand">
          <div className="header-logo">
            <Snowflake size={24} />
          </div>
          <div>
            <div className="header-title">IceStream</div>
            <div className="header-subtitle">Real-Time Lakehouse Observability Platform</div>
          </div>
        </div>

        <div className="header-meta">
          <div className="header-clock">
            <Clock
              size={13}
              style={{
                display: "inline",
                verticalAlign: "middle",
                marginRight: 6,
                opacity: 0.6,
              }}
            />
            {clock}
          </div>

          <div className="header-uptime">
            <span
              className="pulse-dot"
              style={{
                backgroundColor: quarantineState.quarantineActive
                  ? "#ef4444"
                  : backendConnected
                  ? "#10b981"
                  : "#f59e0b",
              }}
            />
            <Database size={13} />
            {quarantineState.quarantineActive
              ? "🚨 QUARANTINED"
              : backendConnected
              ? "PostgreSQL & Iceberg Connected"
              : "Local Simulation"}
          </div>

          <div className="time-range-wrapper">
            <select
              className="time-range-select"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="5m">Last 5m</option>
              <option value="15m">Last 15m</option>
              <option value="30m">Last 30m</option>
              <option value="1h">Last 1h</option>
            </select>
          </div>

          <button
            className={`btn-live-control ${isLive ? "live-active" : "paused-active"}`}
            onClick={() => {
              setIsLive(!isLive);
              showToast(isLive ? "Live stream paused." : "Live stream resumed.");
            }}
            title={isLive ? "Pause Live Streaming" : "Resume Live Streaming"}
          >
            {isLive ? (
              <>
                <span className="live-pulse-ring" />
                <Pause size={13} />
                <span>LIVE STREAM</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>PAUSED</span>
              </>
            )}
          </button>

          <button
            className={`btn-header-action ${isRefreshing ? "refreshing" : ""}`}
            onClick={() => {
              setIsRefreshing(true);
              handleRefresh();
              setTimeout(() => setIsRefreshing(false), 800);
            }}
            title="Refresh Telemetry Data"
          >
            <RotateCw size={14} className={isRefreshing ? "spin-icon" : ""} />
            <span>Refresh</span>
          </button>

          <button
            className="btn-header-action btn-settings-icon"
            onClick={() => setShowSettings(true)}
            title="API Keys & Integration Settings"
          >
            <Key size={14} className="text-cyan" />
            <span>Settings</span>
          </button>

          <button
            className={`btn-header-action btn-bell-icon ${showAlerts ? "active" : ""}`}
            onClick={() => setShowAlerts(!showAlerts)}
            title="System Notifications & Alerts"
          >
            <Bell size={14} />
            {systemAlerts.length > 0 && (
              <span className="alert-badge-count">{systemAlerts.length}</span>
            )}
          </button>

          {showAlerts && (
            <div className="alerts-popover">
              <div className="alerts-header">
                <span>System Notifications ({systemAlerts.length})</span>
              </div>
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.level}`}>
                  <div className="alert-item-header">
                    <span>{alert.service}</span>
                    <span>{alert.timestamp}</span>
                  </div>
                  <div className="alert-item-msg">{alert.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <AnomalyControlPanel
        quarantineState={quarantineState}
        onStateChange={refreshObservabilityState}
      />

      <DataLineageDag quarantineState={quarantineState} />

      <div className="section-title">Infrastructure & Observability Health</div>
      <div className="status-grid">
        <StatusCard serviceKey="kafka" data={statuses.kafka || serviceStatuses.kafka} />
        <StatusCard serviceKey="flink" data={statuses.flink || serviceStatuses.flink} />
        <StatusCard serviceKey="postgres" data={statuses.postgres || serviceStatuses.postgres} />
        <LiveEventCounter />
      </div>

      <div className="section-title">Data Lakehouse Table Format</div>
      <IcebergTimeTravel />

      <div className="section-title">Analytics & Data Quality Overview</div>
      <div className="middle-grid">
        <ThroughputChart />
        <ValidationMetrics />
      </div>

      <div className="section-title">E-Commerce Telemetry Stream (Live Checkout Events)</div>
      <RecentEventsTable events={events} />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSaveToast={showToast}
      />
    </div>
  );
}

export default App;
