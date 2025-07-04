import React from "react";

export default function ClaimList({ claims }) {
  if (!claims || claims.length === 0) return <p>No claims added yet.</p>;

  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">Claim ID</th>
          <th className="p-2 border">Provider ID</th>
          <th className="p-2 border">Risk ID</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Submission Date</th>
          <th className="p-2 border">Summary</th>
        </tr>
      </thead>
      <tbody>
        {claims.map((claim) => (
          <tr key={claim.claim_id}>
            <td className="p-2 border">{claim.claim_id}</td>
            <td className="p-2 border">{claim.provider_id}</td>
            <td className="p-2 border">{claim.risk_id || "N/A"}</td>
            <td className="p-2 border">{claim.status}</td>
            <td className="p-2 border">{claim.submission_date}</td>
            <td className="p-2 border">{claim.summary || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
