import React from "react";

export default function AddClaimForm({ form, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div>
        <label>Provider</label>
        <select name="provider" value={form.provider} onChange={onChange} className="w-full border p-2">
          <option value="">Select Provider</option>
          <option value="Provider A">Provider A</option>
          <option value="Provider B">Provider B</option>
        </select>
      </div>
      <div>
        <label>Risk</label>
        <select name="risk" value={form.risk} onChange={onChange} className="w-full border p-2">
          <option value="">Select Risk</option>
          <option value="Low Risk">Low Risk</option>
          <option value="High Risk">High Risk</option>
        </select>
      </div>
      <div>
        <label>Status</label>
        <select name="status" value={form.status} onChange={onChange} className="w-full border p-2">
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Approved">Approved</option>
          <option value="Denied">Denied</option>
        </select>
      </div>
      <div>
        <label>Submission Date</label>
        <input type="date" name="submissionDate" value={form.submissionDate} onChange={onChange} className="w-full border p-2" />
      </div>
      <div>
        <label>Summary</label>
        <textarea name="summary" value={form.summary} onChange={onChange} className="w-full border p-2" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
}
