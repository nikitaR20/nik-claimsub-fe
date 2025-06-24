import React from "react";

export default function ClaimList({ claims }) {
  if (claims.length === 0) return <p>No claims added yet.</p>;

  return (
    <table className="w-full border mt-4">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">Claim ID</th>
          <th className="p-2 border">Provider</th>
          <th className="p-2 border">Risk</th>
          <th className="p-2 border">Status</th>
          <th className="p-2 border">Submission Date</th>
          <th className="p-2 border">Summary</th>
        </tr>
      </thead>
      <tbody>
        {claims.map((claim) => (
          <tr key={claim.claimId}>
            <td className="p-2 border">{claim.claimId}</td>
            <td className="p-2 border">{claim.provider}</td>
            <td className="p-2 border">{claim.risk}</td>
            <td className="p-2 border">{claim.status}</td>
            <td className="p-2 border">{claim.submissionDate}</td>
            <td className="p-2 border">{claim.summary}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
