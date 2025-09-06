// src/components/UploadDocument.js
import React, { useState, useEffect, useRef } from "react";

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
  const fileInputRef = useRef(null);

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
      setStatusMsg(
        "No documents found or unable to fetch documents for this claim."
      );
      setDocuments([]);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();

    console.log("Uploading document:", { claimId, documentType, file, description });

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
      if (fileInputRef.current) fileInputRef.current.value = "";

      fetchDocuments(claimId);
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div
      style={{
        marginTop: "1rem",
        padding: "1rem",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#f9fafb",
      }}
    >
      <h3>Upload Documents</h3>
      {!claimId && <p style={{ color: "#6b7280" }}>You can upload documents after creating the claim.</p>}

      {!initialClaimId && (
        <div style={{ marginBottom: "1rem" }}>
          <label>Claim ID:</label>
          <input
            type="text"
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            placeholder="Enter Claim ID"
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Document Type <span style={{ color: "red" }}>*</span>
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={!claimId}
            style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }}
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
            File <span style={{ color: "red" }}>*</span>
          </label>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={!claimId} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            disabled={!claimId}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          type="submit"
          disabled={!claimId}
          style={{
            backgroundColor: "#4f46e5",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: claimId ? "pointer" : "not-allowed",
          }}
        >
          Upload Document
        </button>
      </form>

      {statusMsg && <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{statusMsg}</p>}

      <hr style={{ margin: "2rem 0" }} />

      <h4>Uploaded Documents {claimId ? `for Claim ${claimId}` : ""}:</h4>
      {documents.length === 0 ? (
        <p>No documents uploaded yet.</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <li key={doc.document_id}>
              <strong>{doc.document_type.replace(/_/g, " ")}</strong> - {doc.file_name} -{" "}
              {doc.description || "No description"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
