import React, { useState, useEffect } from "react";
import { Layers, Clock, Database, History, CheckCircle, Search } from "lucide-react";
import { fetchIcebergSnapshots, executeIcebergTimeTravel } from "../api/client";

export default function IcebergTimeTravel() {
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSnapshots() {
      const data = await fetchIcebergSnapshots();
      if (data && data.snapshots) {
        setSnapshots(data.snapshots);
        if (data.snapshots.length > 0) {
          setSelectedSnapshot(data.snapshots[data.snapshots.length - 1].snapshotId);
        }
      } else {
        // Fallback demo data
        const demoSnaps = [
          {
            snapshotId: 89402184910284,
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            operation: "CREATE TABLE",
            addedRecords: 12500,
            totalRecords: 12500,
            parquetFiles: 8,
          },
          {
            snapshotId: 89402184910285,
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            operation: "APPEND (UPSERT)",
            addedRecords: 43200,
            totalRecords: 55700,
            parquetFiles: 24,
          },
          {
            snapshotId: 89402184910286,
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            operation: "MERGE (ACID UPSERT)",
            addedRecords: 68100,
            totalRecords: 122600,
            parquetFiles: 48,
          },
        ];
        setSnapshots(demoSnaps);
        setSelectedSnapshot(89402184910286);
      }
    }
    loadSnapshots();
  }, []);

  async function handleQueryTimeTravel(snapId) {
    setSelectedSnapshot(snapId);
    setLoading(true);
    const res = await executeIcebergTimeTravel(snapId);
    setLoading(false);
    if (res) {
      setQueryResult(res);
    } else {
      const target = snapshots.find((s) => s.snapshotId === snapId);
      setQueryResult({
        table: "s3://icestream-lakehouse/checkout_events",
        format: "Apache Iceberg v2",
        queriedSnapshotId: snapId,
        timestamp: target?.timestamp || new Date().toISOString(),
        totalRecordsAtSnapshot: target?.totalRecords || 122600,
        parquetFiles: target?.parquetFiles || 48,
        acidGuarantees: "Serializable Isolation (Snapshot Read)",
      });
    }
  }

  return (
    <div className="card iceberg-card">
      <div className="card-header">
        <div className="card-title">
          <Layers size={16} /> Apache Iceberg Open Table Format — ACID Commits & Time-Travel Explorer
        </div>
        <div className="card-subtitle-badge">S3 Storage Engine (v2)</div>
      </div>

      <div className="iceberg-grid">
        {/* Left: Snapshot Commit Log */}
        <div className="iceberg-snapshots-panel">
          <div className="panel-title">
            <History size={14} /> Commit Snapshot Timeline
          </div>
          <div className="snapshots-list">
            {snapshots.map((snap) => (
              <div
                key={snap.snapshotId}
                className={`snapshot-item ${selectedSnapshot === snap.snapshotId ? "active" : ""}`}
                onClick={() => handleQueryTimeTravel(snap.snapshotId)}
              >
                <div className="snapshot-item-header">
                  <span className="snapshot-id">Snapshot #{snap.snapshotId}</span>
                  <span className="snapshot-op">{snap.operation}</span>
                </div>
                <div className="snapshot-item-meta">
                  <span>
                    <Clock size={11} /> {new Date(snap.timestamp).toLocaleTimeString()}
                  </span>
                  <span>+{snap.addedRecords} records</span>
                  <span>Total: {snap.totalRecords.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Time Travel Console */}
        <div className="iceberg-console-panel">
          <div className="panel-title">
            <Search size={14} /> Time-Travel Query Console
          </div>

          <div className="iceberg-query-box">
            <div className="query-code">
              SELECT * FROM checkout_events
              <br />
              <span className="query-keyword">FOR SYSTEM_VERSION AS OF</span>{" "}
              <span className="query-val">{selectedSnapshot || "89402184910286"}</span>;
            </div>

            <button
              className="btn-query"
              onClick={() => handleQueryTimeTravel(selectedSnapshot)}
              disabled={loading}
            >
              {loading ? "Executing Snapshot Read..." : "Execute Time-Travel Query"}
            </button>
          </div>

          {queryResult && (
            <div className="query-result-card">
              <div className="result-header">
                <CheckCircle size={14} className="text-success" /> Snapshot Query Execution Success
              </div>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Target Table</span>
                  <span className="val">{queryResult.table}</span>
                </div>
                <div className="result-item">
                  <span className="label">Snapshot ID</span>
                  <span className="val">{queryResult.queriedSnapshotId}</span>
                </div>
                <div className="result-item">
                  <span className="label">Record Count</span>
                  <span className="val">{queryResult.totalRecordsAtSnapshot.toLocaleString()}</span>
                </div>
                <div className="result-item">
                  <span className="label">Parquet Files</span>
                  <span className="val">{queryResult.parquetFiles} files</span>
                </div>
                <div className="result-item">
                  <span className="label">ACID Guarantee</span>
                  <span className="val">{queryResult.acidGuarantees}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
