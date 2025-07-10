// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import AddClaimForm from "./components/AddClaimForm";
import ClaimList from "./components/ClaimList";
import UploadDocument from "./components/UploadDocument";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// AddClaimPage component with redirect after submit
function AddClaimPage() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState([]);
  const [risks] = useState([
    { risk_id: "1084bc4d-dd50-4eb4-a7da-591dc0f9bd76", name: "Low Risk" },
    { risk_id: "7fbb4e86-f09a-4766-a9f5-3442d6142ec1", name: "Medium Risk" },
    { risk_id: "8e5d5889-bb99-4dce-be13-d5566637ce70", name: "High Risk" },
  ]);
  const [form, setForm] = useState({
    provider_id: "",
    risk_id: "",
    status: "To Do",
    submission_date: "",
    summary: "",
  });
  const [createdClaimId, setCreatedClaimId] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/providers/`)
      .then((res) => res.json())
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.provider_id || !form.status || !form.submission_date) {
      alert("Please fill in required fields.");
      return;
    }
    const payload = {
      provider_id: form.provider_id,
      risk_id: form.risk_id || null,
      status: form.status,
      submission_date: form.submission_date,
      summary: form.summary || "",
    };

    try {
      const res = await fetch(`${API_BASE}/claims/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create claim");
      const claim = await res.json();

      setCreatedClaimId(claim.claim_id);
      alert(`Claim created successfully!`);

      setForm({
        provider_id: "",
        risk_id: "",
        status: "To Do",
        submission_date: "",
        summary: "",
      });
    } catch (err) {
      alert(err.message);
    }
  };

  // Redirect to Upload Document page
  const goToUpload = () => {
    if (createdClaimId) {
      navigate(`/upload-document/${createdClaimId}`);
    }
  };

  return (
    <div>
      <h2>Add Claim</h2>
      <AddClaimForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        providers={providers}
        risks={risks}
      />
      {createdClaimId && (
        <button
          onClick={goToUpload}
          style={{
            marginTop: "1rem",
            padding: "10px 20px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload Documents for this Claim
        </button>
      )}
    </div>
  );
}

// UploadDocumentPage with optional claimId param from URL
function UploadDocumentPage() {
  const { claimId } = useParams();
  // pass null if claimId undefined for optional claim selection in UploadDocument
  return <UploadDocument claimId={claimId || null} />;
}

// ClaimsPage fetches and passes claims to ClaimList
function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/claims/?skip=0&limit=100`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch claims");
        return res.json();
      })
      .then((data) => {
        setClaims(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading claims...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <h2>Claims List</h2>
      <ClaimList claims={claims} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <nav
        style={{
          padding: "10px",
          borderBottom: "1px solid #ccc",
          marginBottom: "1rem",
        }}
      >
        <Link to="/" style={{ marginRight: "10px" }}>
          Add Claim
        </Link>
        <Link to="/claims" style={{ marginRight: "10px" }}>
          List Claims
        </Link>
        <Link to="/upload-document">Upload Documents</Link>
      </nav>

      <Routes>
        <Route path="/" element={<AddClaimPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/upload-document" element={<UploadDocumentPage />} />
        <Route path="/upload-document/:claimId" element={<UploadDocumentPage />} />
      </Routes>
    </Router>
  );
}
