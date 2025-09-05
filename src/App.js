import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import AddClaimForm from "./components/AddClaimForm";
import ClaimList from "./components/ClaimList";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

function AddClaimPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);

  const [form, setForm] = useState({
    patient_id: "",
    provider_id: "",
    claim_amount: 0,
    claim_date: "",
    claim_type: "",
    claim_submission_method: "",
    claim_status:"",
    predicted_payout: 0,
    approval_probability: 0,
    coverage_notes: "",
    diagnosis_code: "",
    procedure_code: "",
    suggested_diagnosis_code: "",
    suggested_procedure_code: "",
    fraud_flag: false,
    fraud_reason: "",
  });

  // Fetch patients & providers
  useEffect(() => {
    fetch(`${API_BASE}/patients/`)
      .then(res => res.json())
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(() => setPatients([]));

    fetch(`${API_BASE}/providers/`)
      .then(res => res.json())
      .then(data => setProviders(Array.isArray(data) ? data : []))
      .catch(() => setProviders([]));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelectPatient = (e) => {
    const selected = patients.find((p) => p.patient_id === e.target.value);
    if (selected) {
      setForm({
        ...form,
        patient_id: selected.patient_id,
      });
    } else {
      setForm({ ...form, patient_id: "" });
    }
  };

  const handleSelectProvider = (e) => {
    setForm({ ...form, provider_id: e.target.value });
  };

  // ✅ Updated alert for create vs update
  const handleSubmit = async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/claims/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Error details:", errData);
        throw new Error("Failed to save claim");
      }

      await res.json();
      if (formData.claim_id) {
        alert("Claim updated successfully!");
      } else {
        alert("Claim created successfully!");
      }
      navigate("/claims");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AddClaimForm
      onChange={handleChange}
      onSelectPatient={handleSelectPatient}
      onSelectProvider={handleSelectProvider}
      onSubmit={handleSubmit}  // pass form data from child
      patients={patients}
      providers={providers}
    />
  );
}

function ClaimsPage() {
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/claims?skip=0&limit=100`)
      .then((res) => res.json())
      .then((data) => setClaims(Array.isArray(data) ? data : []))
      .catch(() => setClaims([]));
  }, []);

  return <ClaimList claims={claims} />;
}

export default function App() {
  return (
    <Router>
      <nav
        style={{
          padding: "10px",
          borderBottom: "2px solid #2980b9",
          marginBottom: "1rem",
          backgroundColor: "#f0f4f7",
        }}
      >
        <Link to="/" style={{ marginRight: "15px", fontWeight: "bold", color: "#2980b9" }}>
          Create Claim
        </Link>
        <Link to="/claims" style={{ fontWeight: "bold", color: "#2980b9" }}>
          List Claims
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<AddClaimPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
      </Routes>
    </Router>
  );
}
