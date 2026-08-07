import { useState, useMemo } from "react";
import { recentEvents as initialEvents } from "../data/dummyData";
import { List, Search, Filter, Download, Eye, X, Copy, Check } from "lucide-react";

export default function RecentEventsTable({ events = initialEvents }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeModalEvent, setActiveModalEvent] = useState(null);
  const [copied, setCopied] = useState(false);

  // Extract unique topics for dropdown
  const uniqueTopics = useMemo(() => {
    const topics = new Set(events.map((e) => e.topic));
    return ["all", ...Array.from(topics)];
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.topic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTopic = selectedTopic === "all" || e.topic === selectedTopic;
      const matchesStatus = selectedStatus === "all" || e.status === selectedStatus;
      return matchesSearch && matchesTopic && matchesStatus;
    });
  }, [events, searchTerm, selectedTopic, selectedStatus]);

  // Export CSV helper
  function handleExportCSV() {
    const headers = ["Timestamp,Event ID,Topic,Status,Latency"];
    const rows = filteredEvents.map(
      (e) => `${e.timestamp},${e.id},${e.topic},${e.status},${e.latency}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `icestream_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function copyJsonPayload(payload) {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card" id="recent-events-table">
      <div className="table-controls-header">
        <div className="card-title" style={{ marginBottom: 0 }}>
          <List
            size={14}
            style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }}
          />
          Recent Events ({filteredEvents.length})
        </div>

        {/* ── Table Controls ────────────────────────────────────────────────── */}
        <div className="table-filters">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search Event ID or Topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                <X size={12} />
              </button>
            )}
          </div>

          <div className="filter-select-wrapper">
            <Filter size={13} className="select-icon" />
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              {uniqueTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic === "all" ? "All Topics" : topic}
                </option>
              ))}
            </select>
          </div>

          <div className="status-tabs">
            {["all", "success", "warning", "error"].map((st) => (
              <button
                key={st}
                className={`tab-btn ${selectedStatus === st ? "active" : ""} ${st}`}
                onClick={() => setSelectedStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            className="btn-secondary"
            onClick={handleExportCSV}
            title="Export CSV"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="events-table-wrapper">
        <table className="events-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event ID</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Latency</th>
              <th style={{ textAlign: "right" }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  No matching events found.
                </td>
              </tr>
            ) : (
              filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  onClick={() => setActiveModalEvent(event)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{event.timestamp}</td>
                  <td>
                    <span className="event-id">{event.id}</span>
                  </td>
                  <td>
                    <span className="event-topic">{event.topic}</span>
                  </td>
                  <td>
                    <span className={`event-status ${event.status}`}>
                      <span className="event-status-dot" />
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <span className="event-latency">{event.latency}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalEvent(event);
                      }}
                      title="View Payload JSON"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Event Detail Modal ───────────────────────────────────────────── */}
      {activeModalEvent && (
        <div className="modal-backdrop" onClick={() => setActiveModalEvent(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Event Detail Payload</h3>
                <div className="modal-subtitle">
                  ID: <span className="event-id">{activeModalEvent.id}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => copyJsonPayload(activeModalEvent.payload)}
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy JSON"}
                </button>
                <button
                  className="btn-icon"
                  onClick={() => setActiveModalEvent(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="payload-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">Topic</span>
                  <span className="event-topic">{activeModalEvent.topic}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status</span>
                  <span className={`event-status ${activeModalEvent.status}`}>
                    {activeModalEvent.status}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Timestamp</span>
                  <span className="meta-val">{activeModalEvent.timestamp}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Processing Latency</span>
                  <span className="meta-val">{activeModalEvent.latency}</span>
                </div>
              </div>

              <div className="json-container">
                <div className="json-title">Raw Event JSON</div>
                <pre className="json-code">
                  {JSON.stringify(activeModalEvent.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
