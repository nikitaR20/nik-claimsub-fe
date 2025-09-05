import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function ClaimList({ claims }) {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    patient: "",
    provider: "",
    status: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      const patientName = `${c.patient?.first_name ?? ""} ${c.patient?.last_name ?? ""}`.toLowerCase();
      const providerName = `${c.provider?.first_name ?? ""} ${c.provider?.last_name ?? ""}`.toLowerCase();
      return (
        patientName.includes(filters.patient.toLowerCase()) &&
        providerName.includes(filters.provider.toLowerCase()) &&
        c.claim_status?.toLowerCase().includes(filters.status.toLowerCase())
      );
    });
  }, [claims, filters]);

  if (!claims || claims.length === 0) return <p>No claims found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "16px" }}>Claims</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <input
          type="text"
          name="patient"
          value={filters.patient}
          onChange={handleFilterChange}
          placeholder="Filter by Patient"
          style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          name="provider"
          value={filters.provider}
          onChange={handleFilterChange}
          placeholder="Filter by Provider"
          style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          placeholder="Filter by Status"
          style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #ccc" }}
        />
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f3f4f6" }}>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>#</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Patient</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Provider</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Status</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Claim Date</th>
            <th style={{ padding: "8px", border: "1px solid #ddd" }}>Coverage Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredClaims.map((c, idx) => {
            const patientName = `${c.patient?.first_name ?? ""} ${c.patient?.last_name ?? ""}`;
            const providerName = `${c.provider?.first_name ?? ""} ${c.provider?.last_name ?? ""}`;
            return (
              <tr
                key={c.claim_id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate("/", { state: { claim: c } }) // passes claim data to Create Claim page
                }
                title={c.coverage_notes || "No coverage notes"}
              >
                <td style={{ padding: "8px", border: "1px solid #ddd", color: "#4f46e5", fontWeight: 600 }}>
                  {idx + 1}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{patientName}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{providerName}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>{c.claim_status || "Pending"}</td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {c.claim_date ? new Date(c.claim_date).toLocaleDateString() : ""}
                </td>
                <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                  {c.coverage_notes?.length > 30
                    ? c.coverage_notes.substring(0, 30) + "..."
                    : c.coverage_notes}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
