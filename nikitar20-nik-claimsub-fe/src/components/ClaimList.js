import React, { useState } from "react";

export default function ClaimList({ claims, providers, risks }) {
  const [filterProvider, setFilterProvider] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [providerSearch, setProviderSearch] = useState("");
  const [filterSubmissionDate, setFilterSubmissionDate] = useState("");
  const [filterSummary, setFilterSummary] = useState("");

  const filteredProviders = providers.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`;
    return fullName.toLowerCase().includes(providerSearch.toLowerCase());
  });

  const filteredClaims = claims.filter((claim) => {
    const matchProvider = !filterProvider || claim.providerName === filterProvider;
    const matchRisk = !filterRisk || claim.riskName === filterRisk;
    const matchStatus = !filterStatus || claim.status === filterStatus;
    const matchDate = !filterSubmissionDate || claim.submission_date === filterSubmissionDate;
    const matchSummary = !filterSummary || (claim.summary && claim.summary.toLowerCase().includes(filterSummary.toLowerCase()));

    return matchProvider && matchRisk && matchStatus && matchDate && matchSummary;
  });

  if (!claims || claims.length === 0)
    return <p>No claims added yet.</p>;

  return (
    <div style={{ maxWidth: "100vw", padding: "1rem" }}>
      <h3 className="text-xl font-semibold mb-4">Filters</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          overflowX: "auto",
          gap: "1rem",
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "1rem",
          backgroundColor: "white",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Provider Filter */}
        <div style={{ minWidth: 220, border: "1px solid #ccc", borderRadius: 6, padding: "0.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>
            Provider
          </label>
          <input
            type="text"
            placeholder="Type to search provider"
            value={providerSearch}
            onChange={(e) => setProviderSearch(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #999",
              borderRadius: 4,
              padding: "0.5rem",
              marginBottom: "0.5rem",
              outline: "none",
            }}
          />
          <select
            value={filterProvider}
            onChange={(e) => setFilterProvider(e.target.value)}
            size={Math.min(filteredProviders.length + 1, 6)}
            style={{
              width: "100%",
              border: "1px solid #999",
              borderRadius: 4,
              padding: "0.5rem",
              outline: "none",
            }}
          >
            <option value="">All Providers</option>
            {filteredProviders.map((p) => {
              const fullName = `${p.first_name} ${p.last_name}`;
              return (
                <option key={p.provider_id} value={fullName}>
                  {fullName}
                </option>
              );
            })}
          </select>
        </div>

        {/* Risk Filter */}
        <div style={{ minWidth: 180, border: "1px solid #ccc", borderRadius: 6, padding: "0.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>
            Risk
          </label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #999",
              borderRadius: 4,
              padding: "0.5rem",
              outline: "none",
            }}
          >
            <option value="">All Risks</option>
            {risks.map((r) => (
              <option key={r.risk_id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: 180, border: "1px solid #ccc", borderRadius: 6, padding: "0.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #999",
              borderRadius: 4,
              padding: "0.5rem",
              outline: "none",
            }}
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
            <option value="Denied">Denied</option>
          </select>
        </div>

        {/* Submission Date Filter */}
        <div style={{ minWidth: 180, border: "1px solid #ccc", borderRadius: 6, padding: "0.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>
            Submission Date
          </label>
          <input
            type="date"
            value={filterSubmissionDate}
            onChange={(e) => setFilterSubmissionDate(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #999",
              borderRadius: 4,
              padding: "0.5rem",
              outline: "none",
            }}
          />
        </div>

        {/* Summary Filter */}
        <div style={{ minWidth: 180, border: "1px solid #ccc", borderRadius: 6, padding: "0.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: "600" }}>
            Summary
          </label>
          <input
            type="text"
            placeholder="Search summary"
            value={filterSummary}
            onChange={(e) => setFilterSummary(e.target.value)}
            style={{
              width: "100%",
              border: "1px solid #999",
              borderRadius: 4,
              padding: "0.5rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Claims Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
          overflowX: "auto",
          display: "block",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f3f4f6" }}>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left", wordBreak: "break-word" }}>
              Claim ID
            </th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Provider</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Risk</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Submission Date</th>
            <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Summary</th>
          </tr>
        </thead>
        <tbody>
          {filteredClaims.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: "16px", textAlign: "center", color: "#777" }}>
                No claims match the filter criteria.
              </td>
            </tr>
          ) : (
            filteredClaims.map((claim) => (
              <tr key={claim.claim_id} style={{ cursor: "default", backgroundColor: "#fff" }}>
                <td style={{ padding: "12px", border: "1px solid #ddd", wordBreak: "break-word" }}>{claim.claim_id}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{claim.providerName}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{claim.riskName}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{claim.status}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{claim.submission_date}</td>
                <td style={{ padding: "12px", border: "1px solid #ddd" }}>{claim.summary || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
