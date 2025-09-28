import React, { useState, useEffect } from "react";
import ClaimList from "./ClaimList";
import AddClaimForm from "./AddClaimForm";
import { API_BASE_URL } from "../config/api";

const ClaimsManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClaim, setEditingClaim] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/claims`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setClaims(data.claims || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch claims");
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, []);

  const handleOpenForm = (claim = null) => {
    setEditingClaim(claim);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingClaim(null);
    setShowForm(false);
  };

  const handleSuccess = (savedClaim) => {
    setClaims((prev) => {
      if (editingClaim) {
        // Update existing claim
        return prev.map((c) =>
          c.claim_id === savedClaim.claim_id ? savedClaim : c
        );
      } else {
        // Add new claim
        return [savedClaim, ...prev];
      }
    });
    handleCloseForm();
  };

  if (loading) return <p>Loading claims...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => handleOpenForm()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4f46e5",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Create New Claim
        </button>
      </div>

      <ClaimList claims={claims} onEditClaim={handleOpenForm} />

      {showForm && (
        <AddClaimForm
          editingClaim={editingClaim}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default ClaimsManagement;
