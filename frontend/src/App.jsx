import { useState, useEffect } from "react";
import {
  Snowflake,
  Clock,
  Wifi,
  Bell,
  Pause,
  Play,
  RotateCw,
  Database,
  ShieldAlert,
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

function App() {
  const [clock, setClock] = useState(formatClock());
  const [isLive, setIsLive] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [events, setEvents] = useState(() => generateRecentEvents(20));
  const [statuses, setStatuses] = useState(serviceStatuses);
  const [backendConnected, setBackendConnected] = useState(false);
  const [quarantineState, setQuarantineState] = useState({
    quarantineActive: false,
    taxNullRatio: 0,
    refetchCount: 0,
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

  // Live clock tick
  useEffect(() => {
    const id = setInterval(() => setClock(formatClock()), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll observability state & health
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

  // Streaming loop
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

      // Fallback local simulation
      setEvents((prev) => {
        const newEvents = generateRecentEvents(1);
        return [newEvents[0], ...prev.slice(0, 24)];
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isLive, backendConnected]);

  function handleRefresh() {
    refreshObservabilityState();
  }

  return (
    <div className="dashboard">
      {/* ── Header ──────────────────────────────────────────────────────── */}
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

          {/* Time Range Selector */}
          <select
            className="btn-header"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="5m">Last 5m</option>
            <option value="15m">Last 15m</option>
            <option value="30m">Last 30m</option>
            <option value="1h">Last 1h</option>
          </select>

          {/* Pause / Play Live Stream Stream Controls */}
          <button
            className={`btn-header ${isLive ? "active" : ""}`}
            onClick={() => setIsLive(!isLive)}
            title={isLive ? "Pause Live Stream" : "Resume Live Stream"}
          >
            {isLive ? <Pause size={14} /> : <Play size={14} />}
            {isLive ? "Live" : "Paused"}
          </button>

          {/* Refresh Button */}
          <button
            className="btn-header"
            onClick={handleRefresh}
            title="Refresh Data"
          >
            <RotateCw size={14} />
          </button>

          {/* Alerts Bell Popover Trigger */}
          <button
            className="btn-header btn-header-icon"
            onClick={() => setShowAlerts(!showAlerts)}
            title="System Alerts"
          >
            <Bell size={15} />
            {systemAlerts.length > 0 && (
              <span className="alert-badge-count">{systemAlerts.length}</span>
            )}
          </button>

          {/* Alerts Popover Panel */}
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

      {/* ── Interactive Anomaly & Automated Quarantine Control Panel ─────── */}
      <AnomalyControlPanel
        quarantineState={quarantineState}
        onStateChange={refreshObservabilityState}
      />

      {/* ── React Flow Data Lineage DAG ──────────────────────────────────── */}
      <DataLineageDag quarantineState={quarantineState} />

      {/* ── Infrastructure Status Cards ──────────────────────────────────── */}
      <div className="section-title">Infrastructure & Observability Health</div>
      <div className="status-grid">
        <StatusCard serviceKey="kafka" data={statuses.kafka || serviceStatuses.kafka} />
        <StatusCard serviceKey="flink" data={statuses.flink || serviceStatuses.flink} />
        <StatusCard serviceKey="postgres" data={statuses.postgres || serviceStatuses.postgres} />
        <LiveEventCounter />
      </div>

      {/* ── Apache Iceberg Open Table Format Engine ───────────────────────── */}
      <div className="section-title">Data Lakehouse Table Format</div>
      <IcebergTimeTravel />

      {/* ── Analytics Overview (Throughput + Validation) ────────────────── */}
      <div className="section-title">Analytics & Data Quality Overview</div>
      <div className="middle-grid">
        <ThroughputChart />
        <ValidationMetrics />
      </div>

      {/* ── E-Commerce Telemetry Event Stream ───────────────────────────── */}
      <div className="section-title">E-Commerce Telemetry Stream (Live Checkout Events)</div>
      <RecentEventsTable events={events} />
    </div>
  );
}

export default App;
