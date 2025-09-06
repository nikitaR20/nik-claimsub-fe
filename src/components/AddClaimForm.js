import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import UploadDocument from "./UploadDocument";
import { API_BASE } from "../App"; // adjust path if needed

export default function AddClaimForm({
  onChange,
  onSelectPatient,
  onSelectProvider,
  onSubmit,
  patients,
  providers,
}) {
  const location = useLocation();

  const safePatients = useMemo(() => (Array.isArray(patients) ? patients : []), [patients]);
  const safeProviders = useMemo(() => (Array.isArray(providers) ? providers : []), [providers]);

  const [form, setForm] = useState({
    claim_id: "",
    patient_id: "",
    patient_age: "",
    patient_gender: "",
    patient_income: "",
    patient_marital_status: "",
    patient_employment_status: "",
    provider_id: "",
    provider_specialty: "",
    provider_location: "",
    coverage_notes: "",
    claim_date: "",
    claim_amount: "",
    claim_status: "",
    claim_type: "",
    claim_submission_method: "",
    diagnosis_code: "",
    procedure_code: "",
    suggested_diagnosis_code: "",
    suggested_procedure_code: "",
    approval_probability: 0,
    fraud_flag: false,
    fraud_reason: "",
    predicted_payout: 0,
  });

  const [suggestions, setSuggestions] = useState(null); // <-- store suggested codes

  useEffect(() => {
    if (location.state?.initialData) {
      const data = { ...location.state.initialData };
      if (data.claim_date) {
        data.claim_date = new Date(data.claim_date).toISOString().split("T")[0];
      }
      setForm(data);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : name === "approval_probability" ? Number(value) : value,
    }));
  };

  const handleSelectPatient = (e) => {
    const patientId = e.target.value;
    const selected = safePatients.find((p) => String(p.patient_id) === String(patientId));
    if (selected) {
      setForm((prev) => ({
        ...prev,
        patient_id: selected.patient_id ?? "",
        patient_age: selected.patient_age ?? "",
        patient_gender: selected.patient_gender ?? "",
        patient_income: selected.patient_income ?? "",
        patient_marital_status: selected.patient_marital_status ?? "",
        patient_employment_status: selected.patient_employment_status ?? "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        patient_id: "",
        patient_age: "",
        patient_gender: "",
        patient_income: "",
        patient_marital_status: "",
        patient_employment_status: "",
      }));
    }
  };

  const handleSelectProvider = (e) => {
    const providerId = e.target.value;
    const selected = safeProviders.find((p) => String(p.provider_id) === String(providerId));
    if (selected) {
      setForm((prev) => ({
        ...prev,
        provider_id: selected.provider_id ?? "",
        provider_specialty: selected.specialty ?? selected.provider_specialty ?? "",
        provider_location: selected.location ?? selected.provider_location ?? "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        provider_id: "",
        provider_specialty: "",
        provider_location: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    const payload = {
      ...form,
      claim_id: form.claim_id || null,
      claim_date: form.claim_date ? new Date(form.claim_date).toISOString().split("T")[0] : null,
      claim_amount: Number(form.claim_amount) || 0,
      approval_probability: Number(form.approval_probability) || 0,
      predicted_payout: Number(form.predicted_payout) || 0,
    };

    const mode = form.claim_id ? "update" : "create";
    const result = await onSubmit?.({ ...payload, mode });

    // ✅ Fix: Set claim_id immediately after creating new claim
    if (mode === "create" && result?.claim_id) {
      setForm(prev => ({ ...prev, claim_id: result.claim_id }));
    }
  };

  const handleSuggestCodes = async () => {
    if (!form.coverage_notes.trim()) {
      alert("Please enter coverage notes first");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/ai/suggest_codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverage_notes: form.coverage_notes }),
      });

      if (!res.ok) throw new Error("AI suggestion failed");

      const data = await res.json();

      // Save suggestions to state
      setSuggestions(data);

      // Auto-fill top suggestions into diagnosis_code and procedure_code fields
      setForm(prev => ({
        ...prev,
        suggested_diagnosis_code: data.suggested_diagnosis_codes?.[0]?.code || "",
        suggested_procedure_code: data.suggested_procedure_codes?.[0]?.code || "",
        diagnosis_code: data.suggested_diagnosis_codes?.[0]?.code || prev.diagnosis_code,
        procedure_code: data.suggested_procedure_codes?.[0]?.code || prev.procedure_code,
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-wrap">
      <style>{`
        .app-wrap { min-height: 100dvh; display: flex; align-items: center; justify-content: center; background: #f8fafc; padding: 24px; }
        .card { width: 100%; max-width: 980px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 10px 24px rgba(2,6,23,0.07); padding: 32px; }
        .title { text-align: center; font-size: 28px; font-weight: 800; color: #4f46e5; margin: 0 0 24px; }
        .section { margin: 20px 0; }
        .label { display: block; font-weight: 600; color: #374151; margin-bottom: 8px; }
        .grid { display: grid; gap: 16px; }
        .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        @media (max-width: 900px) { .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; } }
        .input, .select, .textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 10px; padding: 10px 12px; font-size: 14px; line-height: 1.4; outline: none; }
        .textarea { min-height: 90px; resize: vertical; }
        .input[readonly] { background: #f3f4f6; color: #4b5563; }
        .input:focus, .select:focus, .textarea:focus { border-color: #818cf8; box-shadow: 0 0 0 3px rgba(99,102,241,0.25); }
        .range-wrap { display: grid; gap: 8px; }
        .range { width: 100%; }
        .muted { color: #4b5563; font-weight: 600; text-align: right; }
        .row { display: flex; gap: 10px; align-items: center; }
        .btn { appearance: none; border: none; border-radius: 10px; padding: 10px 18px; background: #4f46e5; color: white; font-weight: 700; cursor: pointer; transition: transform .02s ease, box-shadow .2s ease, background .2s ease; }
        .btn:hover { background: #4338ca; }
        .btn:active { transform: translateY(1px); }
        .footer { display: flex; justify-content: center; margin-top: 12px; }
        .helper { font-size: 12px; color: #6b7280; margin-top: 6px; }
      `}</style>

      <div className="card">
        <h2 className="title">{form.claim_id ? "Edit Claim" : "Create Claim"}</h2>
        <form onSubmit={handleSubmit}>
          {/* Patient selection */}
          <div className="section">
            <label className="label">Patient</label>
            <select
              name="patient_id"
              value={form.patient_id}
              onChange={handleSelectPatient}
              className="select"
            >
              <option value="">Select patient</option>
              {safePatients.map((p) => (
                <option key={String(p.patient_id)} value={String(p.patient_id)}>
                  {(p.first_name ?? "").trim()} {(p.last_name ?? "").trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-populated Patient details */}
          <div className="section grid grid-3">
            <input type="text" value={form.patient_age} readOnly placeholder="Age" className="input" />
            <input type="text" value={form.patient_gender} readOnly placeholder="Gender" className="input" />
            <input type="text" value={form.patient_income} readOnly placeholder="Income" className="input" />
            <input type="text" value={form.patient_marital_status} readOnly placeholder="Marital Status" className="input" />
            <input type="text" value={form.patient_employment_status} readOnly placeholder="Employment Status" className="input" />
          </div>

          {/* Provider selection */}
          <div className="section">
            <label className="label">Provider</label>
            <select
              name="provider_id"
              value={form.provider_id}
              onChange={handleSelectProvider}
              className="select"
            >
              <option value="">Select provider</option>
              {safeProviders.map((p) => (
                <option key={String(p.provider_id)} value={String(p.provider_id)}>
                  {(p.first_name ?? "").trim()} {(p.last_name ?? "").trim()} {p.specialty ? `- ${p.specialty}` : ""} {p.location ? `- ${p.location}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Provider details */}
          <div className="section grid grid-2">
            <input type="text" value={form.provider_specialty} readOnly placeholder="Provider Specialty" className="input" />
            <input type="text" value={form.provider_location} readOnly placeholder="Provider Location" className="input" />
          </div>

          {/* Coverage Notes */}
          <div className="section">
            <label className="label">Coverage Notes</label>
            <textarea name="coverage_notes" value={form.coverage_notes} onChange={handleChange} className="textarea" />
            <button
              type="button"
              className="btn"
              style={{ marginTop: "8px" }}
              onClick={handleSuggestCodes}
            >
              Suggest Codes
            </button>
          </div>

          {/* Show suggestions below */}
          {suggestions && (
            <div className="section">
              <h4 className="label">AI Suggested Codes</h4>
              <div>
                <strong>Diagnosis Codes:</strong>
                <ul>
                  {suggestions.suggested_diagnosis_codes?.map((dx, idx) => (
                    <li key={idx}>
                      {dx.code} - {dx.description}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ marginTop: "8px" }}>
                <strong>Procedure Codes:</strong>
                <ul>
                  {suggestions.suggested_procedure_codes?.map((proc, idx) => (
                    <li key={idx}>
                      {proc.code} - {proc.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Claim Amount, Date, Status */}
          <div className="section grid grid-2">
            <div>
              <label className="label">Claim Amount</label>
              <input
                type="number"
                step="0.01"
                name="claim_amount"
                value={form.claim_amount}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Claim Date</label>
              <input
                type="date"
                name="claim_date"
                value={form.claim_date}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Claim Status</label>
              <select
                name="claim_status"
                value={form.claim_status}
                onChange={handleChange}
                className="select"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
                <option value="In Review">In Review</option>
              </select>
            </div>
          </div>

          {/* Claim Type & Submission Method */}
          <div className="section grid grid-2">
            <div>
              <label className="label">Claim Type</label>
              <select name="claim_type" value={form.claim_type} onChange={handleChange} className="select">
                <option value="">Select Type</option>
                <option value="Inpatient">Inpatient</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Emergency">Emergency</option>
                <option value="Dental">Dental</option>
              </select>
            </div>
            <div>
              <label className="label">Submission Method</label>
              <select name="claim_submission_method" value={form.claim_submission_method} onChange={handleChange} className="select">
                <option value="">Select Method</option>
                <option value="Electronic">Electronic (EDI)</option>
                <option value="Paper">Paper</option>
                <option value="Portal">Portal Upload</option>
              </select>
            </div>
          </div>

          {/* Codes */}
          <div className="section grid grid-4">
            <input type="text" name="diagnosis_code" value={form.diagnosis_code} onChange={handleChange} placeholder="Diagnosis Code" className="input" />
            <input type="text" name="procedure_code" value={form.procedure_code} onChange={handleChange} placeholder="Procedure Code" className="input" />
            <input type="text" name="suggested_diagnosis_code" value={form.suggested_diagnosis_code} onChange={handleChange} placeholder="Suggested Dx Code" className="input" />
            <input type="text" name="suggested_procedure_code" value={form.suggested_procedure_code} onChange={handleChange} placeholder="Suggested Proc Code" className="input" />
          </div>

          {/* Approval Probability */}
          <div className="section range-wrap">
            <label className="label">Approval Probability</label>
            <input
              type="range"
              name="approval_probability"
              value={Number(form.approval_probability) || 0}
              onChange={handleChange}
              min="0"
              max="100"
              className="range"
            />
            <div className="muted">{Number(form.approval_probability) || 0}%</div>
            <input
              type="text"
              name="predicted_payout"
              value={form.predicted_payout}
              readOnly
              onChange={handleChange}
              placeholder="Predicted Payout"
              className="input"
            />
          </div>

          {/* Fraud */}
          <div className="section">
            <label className="label">Fraud</label>
            <div className="row">
              <input
                type="checkbox"
                name="fraud_flag"
                checked={!!form.fraud_flag}
                onChange={handleChange}
              />
              <span>Flag as potential fraud</span>
            </div>
          </div>

          <div className="section">
            <label className="label">Fraud Reason</label>
            <input
              type="text"
              name="fraud_reason"
              value={form.fraud_reason}
              onChange={handleChange}
              className="input"
              placeholder="Reason (optional)"
            />
          </div>

          {/* Submit Button */}
          <div className="footer">
            <button type="submit" className="btn">Submit</button>
          </div>
        </form>

        {/* Upload Documents */}
        <div className="section">
          <h3>Upload Documents</h3>
          {form.claim_id ? (
            <UploadDocument claimId={form.claim_id} />
          ) : (
            <p style={{ color: "#6b7280" }}>
              You can upload documents after creating the claim.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
