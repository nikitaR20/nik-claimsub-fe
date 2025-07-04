import React from "react";

export default function AddClaimForm({ form, onChange, onSubmit, providers, risks }) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label>Provider</label>
        <select
          name="provider_id"
          value={form.provider_id || ""}
          onChange={onChange}
          className="w-full border p-2"
          required
        >
          <option value="">Select Provider</option>
          {providers.map((p) => (
            <option key={p.provider_id} value={p.provider_id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Risk</label>
        <select
          name="risk_id"
          value={form.risk_id || ""}
          onChange={onChange}
          className="w-full border p-2"
        >
          <option value="">Select Risk</option>
          {risks.map((r) => (
            <option key={r.risk_id} value={r.risk_id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Status</label>
        <select
          name="status"
          value={form.status || "To Do"}
          onChange={onChange}
          className="w-full border p-2"
          required
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Approved">Approved</option>
          <option value="Denied">Denied</option>
        </select>
      </div>

      <div>
        <label>Submission Date</label>
        <input
          type="date"
          name="submission_date"
          value={form.submission_date || ""}
          onChange={onChange}
          className="w-full border p-2"
          required
        />
      </div>

      <div>
        <label>Summary</label>
        <textarea
          name="summary"
          value={form.summary || ""}
          onChange={onChange}
          className="w-full border p-2"
        />
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
