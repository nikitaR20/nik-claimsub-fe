// src/components/UploadDocument.js
import React, { useState, useEffect } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const documentTypes = [
  { value: "discharge_summary", label: "Discharge Summary" },
  { value: "bill", label: "Bill" },
  { value: "prescription", label: "Prescription" },
  { value: "insurance_card", label: "Insurance Card" },
  { value: "lab_report", label: "Lab Report" },
];

export default function UploadDocument({ claimId: initialClaimId }) {
  const [claimId, setClaimId] = useState(initialClaimId || "");
  const [documentType, setDocumentType] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [documents, setDocuments] = useState([]);

  // Fetch documents whenever claimId changes and is not empty
  useEffect(() => {
    if (claimId) {
      fetchDocuments(claimId);
    } else {
      setDocuments([]);
    }
  }, [claimId]);

  const fetchDocuments = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/claim-documents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const docs = await res.json();
      setDocuments(docs);
      setStatusMsg("");
    } catch (err) {
      setStatusMsg(`Error fetching documents: ${err.message}`);
      setDocuments([]);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!claimId) {
      setStatusMsg("Please enter a claim ID.");
      return;
    }
    if (!documentType) {
      setStatusMsg("Please select a document type.");
      return;
    }
    if (!file) {
      setStatusMsg("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("claim_id", claimId);
    formData.append("document_type", documentType);
    formData.append("file", file);
    formData.append("description", description);

    try {
      const res = await fetch(`${API_BASE}/claim-documents/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      setStatusMsg("Document uploaded successfully!");
      setDocumentType("");
      setFile(null);
      setDescription("");
      // Refresh document list after upload
      fetchDocuments(claimId);
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Upload Document for Claim: {claimId || "Please enter Claim ID"}</h2>

      {/* Show editable claimId input only if no initialClaimId */}
      {!initialClaimId && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Claim ID:</label>
          <input
            type="text"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value.trim())}
            placeholder="Enter Claim ID"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Document Type: <span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
            style={{ display: "block", width: "100%", padding: "8px" }}
          >
            <option value="">Select Document Type</option>
            {documentTypes.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            File: <span style={{ color: "red" }}>*</span>
          </label>
          <input type="file" onChange={handleFileChange} required />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Description (optional):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#4caf50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload Document
        </button>
      </form>

      {statusMsg && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{statusMsg}</p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h3>Documents for Claim {claimId || ""}:</h3>
      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.document_id}>
              <strong>{doc.document_type.replace(/_/g, " ")}</strong> -{" "}
              {doc.file_name} - {doc.description || "No description"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
