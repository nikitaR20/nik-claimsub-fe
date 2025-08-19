import React from "react";

export default function AddClaimForm({ form, onChange, onSubmit, providers, risks }) {
  return (
    <form
      onSubmit={onSubmit}
      style={{
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: "#fff",
        borderRadius: "6px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "1rem", fontWeight: "600", color: "#333" }}>
        Add New Claim
      </h2>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600" }}>
          Provider <span style={{ color: "red" }}>*</span>
        </label>
        <select
          name="provider_id"
          value={form.provider_id || ""}
          onChange={onChange}
          required
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="">Select Provider</option>
          {providers.map((p) => (
            <option key={p.provider_id} value={p.provider_id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600" }}>
          Risk
        </label>
        <select
          name="risk_id"
          value={form.risk_id || ""}
          onChange={onChange}
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="">Select Risk</option>
          {risks.map((r) => (
            <option key={r.risk_id} value={r.risk_id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600" }}>
          Status <span style={{ color: "red" }}>*</span>
        </label>
        <select
          name="status"
          value={form.status || "To Do"}
          onChange={onChange}
          required
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Approved">Approved</option>
          <option value="Denied">Denied</option>
        </select>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600" }}>
          Submission Date <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="date"
          name="submission_date"
          value={form.submission_date || ""}
          onChange={onChange}
          required
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: "600" }}>
          Summary
        </label>
        <textarea
          name="summary"
          value={form.summary || ""}
          onChange={onChange}
          rows={4}
          style={{
            width: "100%",
            padding: "0.6rem 0.8rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
            resize: "vertical",
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          width: "100%",
          padding: "12px 0",
          backgroundColor: "#4caf50",
          color: "#fff",
          fontSize: "1.1rem",
          fontWeight: "600",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 3px 8px rgba(76, 175, 80, 0.6)",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#388e3c")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4caf50")}
      >
        Submit
      </button>
    </form>
  );
}
