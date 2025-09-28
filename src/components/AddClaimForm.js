import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { 
  CLAIM_STATUS_OPTIONS, 
  INSURANCE_TYPE_OPTIONS, 
  PLACE_OF_SERVICE_CODES, 
  GENDER_OPTIONS,
  formatDate
} from '../config/api';

const AddClaimForm = ({ onClose, onSuccess, editingClaim = null }) => {
  const { apiCall } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const [formData, setFormData] = useState({
    // Basic claim info
    patient_id: '',
    provider_id: '',
    insurance_id: '',
    claim_date: new Date().toISOString().split('T')[0],
    claim_status: 'DRAFT',
    claim_type: 'PROFESSIONAL',
    
    // Financial info
    total_charge: '',
    amount_paid: '',
    balance_due: '',
    
    // Condition related
    condition_employment_related: false,
    condition_auto_accident: false,
    condition_auto_accident_state: '',
    condition_other_accident: false,
    
    // Additional info
    coverage_notes: '',
    additional_claim_info: '',
    authorization_number: '',
    
    // Service lines with HCPCS support
    service_lines: [{
      service_date_from: new Date().toISOString().split('T')[0],
      service_date_to: '',
      place_of_service_code: '11',
      cpt_hcpcs_code: '',
      code_type: 'CPT', // New field for code type
      modifier1: '',
      modifier2: '',
      modifier3: '',
      modifier4: '',
      diagnosis_pointer: 'A',
      charge_amount: '',
      units: 1,
      rendering_provider_npi: ''
    }],
    
    // Diagnoses
    diagnoses: [{
      position: 1,
      icd10_code: '',
      diagnosis_pointer: 'A'
    }]
  });

  useEffect(() => {
    loadFormData();
    if (editingClaim) {
      populateEditForm();
    }
  }, [editingClaim]);

  const loadFormData = async () => {
    try {
      // Load patients
      const patientsData = await apiCall('/patients');
      setPatients(Array.isArray(patientsData) ? patientsData : []);

      // Load providers
      const providersData = await apiCall('/providers');
      setProviders(Array.isArray(providersData) ? providersData : []);

      // Load insurances - will be filtered by patient
      const insurancesData = await apiCall('/insurances');
      setInsurances(Array.isArray(insurancesData) ? insurancesData : []);

    } catch (error) {
      console.error('Error loading form data:', error);
      setError('Failed to load form data');
    }
  };

  const populateEditForm = () => {
    if (!editingClaim) return;
    
    setFormData({
      ...editingClaim,
      // Ensure we have proper defaults for required fields
      patient_id: editingClaim.patient_id || '',
      provider_id: editingClaim.provider_id || '',
      insurance_id: editingClaim.insurance_id || '',
      claim_date: editingClaim.claim_date || new Date().toISOString().split('T')[0],
      service_lines: editingClaim.service_lines && editingClaim.service_lines.length > 0 
        ? editingClaim.service_lines.map(sl => ({
            ...sl,
            service_date_from: sl.service_date_from || new Date().toISOString().split('T')[0],
            service_date_to: sl.service_date_to || '',
            place_of_service_code: sl.place_of_service_code || '11',
            code_type: sl.code_type || determineCodeType(sl.cpt_hcpcs_code), // Auto-detect if missing
            diagnosis_pointer: sl.diagnosis_pointer || 'A',
            charge_amount: sl.charge_amount?.toString() || '',
            units: sl.units || 1
          }))
        : [{
            service_date_from: new Date().toISOString().split('T')[0],
            service_date_to: '',
            place_of_service_code: '11',
            cpt_hcpcs_code: '',
            code_type: 'CPT',
            modifier1: '',
            modifier2: '',
            modifier3: '',
            modifier4: '',
            diagnosis_pointer: 'A',
            charge_amount: '',
            units: 1,
            rendering_provider_npi: ''
          }],
      diagnoses: editingClaim.diagnoses && editingClaim.diagnoses.length > 0
        ? editingClaim.diagnoses.map((diag, index) => ({
            position: diag.position || index + 1,
            icd10_code: diag.icd10_code || '',
            diagnosis_pointer: String.fromCharCode(65 + index) // A, B, C, D
          }))
        : [{
            position: 1,
            icd10_code: '',
            diagnosis_pointer: 'A'
          }]
    });
  };

  // Helper function to determine code type based on code format
  const determineCodeType = (code) => {
    if (!code) return 'CPT';
    
    // HCPCS codes typically start with a letter
    if (code.length >= 3 && /^[A-Z]/.test(code)) {
      return 'HCPCS';
    }
    
    // CPT codes are typically 5 digits
    if (/^\d{5}$/.test(code)) {
      return 'CPT';
    }
    
    return 'CPT'; // Default
  };

  // Validate code format based on type
  const validateCode = (code, codeType) => {
    if (!code) return { valid: false, message: 'Code is required' };
    
    if (codeType === 'CPT') {
      if (!/^\d{5}$/.test(code)) {
        return { valid: false, message: 'CPT codes must be 5 digits' };
      }
    } else if (codeType === 'HCPCS') {
      if (!/^[A-Z]\d{4}/.test(code)) {
        return { valid: false, message: 'HCPCS codes must start with a letter followed by 4+ digits' };
      }
    }
    
    return { valid: true, message: '' };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If patient changes, filter insurances and update selected patient info
    if (name === 'patient_id') {
      const patient = patients.find(p => p.patient_id.toString() === value.toString());
      setSelectedPatient(patient || null);
      
      // Filter insurances for this patient and auto-select if only one
      const patientInsurances = insurances.filter(ins => 
        ins.patient_id.toString() === value.toString()
      );
      
      setFormData(prev => ({
        ...prev,
        insurance_id: patientInsurances.length === 1 ? patientInsurances[0].insurance_id : ''
      }));
    }
  };

  const handleServiceLineChange = (index, field, value) => {
    setFormData(prev => {
      const newServiceLines = [...prev.service_lines];
      
      // Special handling for code changes
      if (field === 'cpt_hcpcs_code') {
        // Auto-detect code type based on format
        const detectedType = determineCodeType(value);
        newServiceLines[index] = {
          ...newServiceLines[index],
          [field]: value,
          code_type: detectedType
        };
      } else {
        newServiceLines[index] = {
          ...newServiceLines[index],
          [field]: value
        };
      }
      
      return {
        ...prev,
        service_lines: newServiceLines
      };
    });
  };

  const handleDiagnosisChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      diagnoses: prev.diagnoses.map((diag, i) => 
        i === index ? { ...diag, [field]: value } : diag
      )
    }));
  };

  const addServiceLine = () => {
    setFormData(prev => ({
      ...prev,
      service_lines: [...prev.service_lines, {
        service_date_from: new Date().toISOString().split('T')[0],
        service_date_to: '',
        place_of_service_code: '11',
        cpt_hcpcs_code: '',
        code_type: 'CPT',
        modifier1: '',
        modifier2: '',
        modifier3: '',
        modifier4: '',
        diagnosis_pointer: String.fromCharCode(65 + prev.service_lines.length),
        charge_amount: '',
        units: 1,
        rendering_provider_npi: ''
      }]
    }));
  };

  const removeServiceLine = (index) => {
    if (formData.service_lines.length > 1) {
      setFormData(prev => ({
        ...prev,
        service_lines: prev.service_lines.filter((_, i) => i !== index)
      }));
    }
  };

  const addDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnoses: [...prev.diagnoses, {
        position: prev.diagnoses.length + 1,
        icd10_code: '',
        diagnosis_pointer: String.fromCharCode(65 + prev.diagnoses.length)
      }]
    }));
  };

  const removeDiagnosis = (index) => {
    if (formData.diagnoses.length > 1) {
      setFormData(prev => ({
        ...prev,
        diagnoses: prev.diagnoses.filter((_, i) => i !== index)
      }));
    }
  };

  const getAISuggestions = async () => {
    if (!formData.coverage_notes.trim() && !formData.additional_claim_info.trim()) {
      setError('Please add coverage notes or additional information for AI suggestions');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const notes = `${formData.coverage_notes} ${formData.additional_claim_info}`.trim();
      const response = await apiCall('/ai/suggest-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: notes,
          diagnosis_codes: formData.diagnoses.map(d => d.icd10_code).filter(Boolean),
          coverage_notes: formData.coverage_notes,
          top_n: 5
        })
      });

      setAiSuggestions(response);
      setShowAISuggestions(true);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      setError('Failed to get AI suggestions. ' + (error.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const applyAISuggestion = (type, suggestion) => {
    if (type === 'diagnosis') {
      // Find first empty diagnosis slot or add new one
      const emptyIndex = formData.diagnoses.findIndex(d => !d.icd10_code);
      if (emptyIndex >= 0) {
        handleDiagnosisChange(emptyIndex, 'icd10_code', suggestion.code);
      } else {
        setFormData(prev => ({
          ...prev,
          diagnoses: [...prev.diagnoses, {
            position: prev.diagnoses.length + 1,
            icd10_code: suggestion.code,
            diagnosis_pointer: String.fromCharCode(65 + prev.diagnoses.length)
          }]
        }));
      }
    } else if (type === 'procedure') {
      // Apply to first service line or first empty one
      const emptyIndex = formData.service_lines.findIndex(sl => !sl.cpt_hcpcs_code);
      const targetIndex = emptyIndex >= 0 ? emptyIndex : 0;
      
      // Set both code and type
      const codeType = suggestion.code_type || determineCodeType(suggestion.code);
      handleServiceLineChange(targetIndex, 'cpt_hcpcs_code', suggestion.code);
      handleServiceLineChange(targetIndex, 'code_type', codeType);
    }
  };

  const validateForm = () => {
    // Required field validation
    if (!formData.patient_id) return 'Please select a patient';
    if (!formData.provider_id) return 'Please select a provider';
    if (!formData.claim_date) return 'Please enter claim date';
    
    // Validate service lines
    if (!formData.service_lines || formData.service_lines.length === 0) {
      return 'At least one service line is required';
    }
    
    for (let i = 0; i < formData.service_lines.length; i++) {
      const line = formData.service_lines[i];
      if (!line.service_date_from) return `Service date is required for line ${i + 1}`;
      if (!line.cpt_hcpcs_code?.trim()) return `CPT/HCPCS code is required for line ${i + 1}`;
      
      // Validate code format
      const codeValidation = validateCode(line.cpt_hcpcs_code, line.code_type);
      if (!codeValidation.valid) {
        return `Line ${i + 1}: ${codeValidation.message}`;
      }
      
      if (!line.charge_amount || parseFloat(line.charge_amount) <= 0) {
        return `Valid charge amount is required for line ${i + 1}`;
      }
      if (!line.units || parseInt(line.units) <= 0) {
        return `Valid units count is required for line ${i + 1}`;
      }
    }
    
    // Validate diagnoses
    if (!formData.diagnoses || formData.diagnoses.length === 0) {
      return 'At least one diagnosis is required';
    }
    
    for (let i = 0; i < formData.diagnoses.length; i++) {
      const diag = formData.diagnoses[i];
      if (!diag.icd10_code?.trim()) return `ICD-10 code is required for diagnosis ${i + 1}`;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        // Ensure numeric fields are properly converted
        patient_id: formData.patient_id ? parseInt(formData.patient_id) : null,
        provider_id: formData.provider_id ? parseInt(formData.provider_id) : null,
        insurance_id: formData.insurance_id ? parseInt(formData.insurance_id) : null,
        total_charge: formData.total_charge ? parseFloat(formData.total_charge) : null,
        amount_paid: formData.amount_paid ? parseFloat(formData.amount_paid) : null,
        balance_due: formData.balance_due ? parseFloat(formData.balance_due) : null,
        
        service_lines: formData.service_lines.map(line => ({
          ...line,
          charge_amount: parseFloat(line.charge_amount),
          units: parseInt(line.units) || 1,
          service_date_to: line.service_date_to || null,
          // Remove empty modifiers
          modifier1: line.modifier1?.trim() || null,
          modifier2: line.modifier2?.trim() || null,
          modifier3: line.modifier3?.trim() || null,
          modifier4: line.modifier4?.trim() || null,
          // Ensure code_type is included
          code_type: line.code_type || 'CPT'
        })),
        
        diagnoses: formData.diagnoses.map(diag => ({
          ...diag,
          position: parseInt(diag.position),
          icd10_code: diag.icd10_code?.trim()
        }))
      };

      let result;
      if (editingClaim) {
        // Update existing claim
        result = await apiCall(`/claims/${editingClaim.claim_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        });
      } else {
        // Create new claim
        result = await apiCall('/claims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData)
        });
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError(error.message || 'Failed to submit claim');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get code type badge styling
  const getCodeTypeBadge = (codeType) => {
    const baseClasses = "inline-block px-2 py-1 text-xs font-medium rounded";
    switch (codeType) {
      case 'CPT':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'HCPCS':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const patientInsurances = selectedPatient 
    ? insurances.filter(ins => ins.patient_id.toString() === selectedPatient.patient_id.toString())
    : [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {editingClaim ? 'Edit Claim' : 'Create New Claim'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient *</label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.patient_id} value={patient.patient_id}>
                    {patient.first_name} {patient.last_name} - DOB: {formatDate(patient.birth_date)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Provider *</label>
              <select
                name="provider_id"
                value={formData.provider_id}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Provider</option>
                {providers.map((provider) => (
                  <option key={provider.provider_id} value={provider.provider_id}>
                    Dr. {provider.first_name} {provider.last_name} - NPI: {provider.npi}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance</label>
              <select
                name="insurance_id"
                value={formData.insurance_id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={!selectedPatient}
              >
                <option value="">Select Insurance</option>
                {patientInsurances.map((insurance) => (
                  <option key={insurance.insurance_id} value={insurance.insurance_id}>
                    {insurance.insurance_type} - {insurance.policy_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Claim Date *</label>
              <input
                type="date"
                name="claim_date"
                value={formData.claim_date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="claim_status"
                value={formData.claim_status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {CLAIM_STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Authorization Number</label>
              <input
                type="text"
                name="authorization_number"
                value={formData.authorization_number}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Diagnoses Section */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Diagnoses</h4>
              <button
                type="button"
                onClick={addDiagnosis}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
              >
                Add Diagnosis
              </button>
            </div>
            
            {formData.diagnoses.map((diagnosis, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="number"
                    value={diagnosis.position}
                    onChange={(e) => handleDiagnosisChange(index, 'position', e.target.value)}
                    min="1"
                    max="12"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">ICD-10 Code *</label>
                  <input
                    type="text"
                    value={diagnosis.icd10_code}
                    onChange={(e) => handleDiagnosisChange(index, 'icd10_code', e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-end">
                  {formData.diagnoses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDiagnosis(index)}
                      className="bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Service Lines Section with HCPCS Support */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Service Lines</h4>
              <button
                type="button"
                onClick={addServiceLine}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
              >
                Add Service Line
              </button>
            </div>
            
            {formData.service_lines.map((line, index) => {
              const codeValidation = validateCode(line.cpt_hcpcs_code, line.code_type);
              
              return (
                <div key={index} className="border border-gray-200 rounded-md p-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Date From *</label>
                      <input
                        type="date"
                        value={line.service_date_from}
                        onChange={(e) => handleServiceLineChange(index, 'service_date_from', e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Service Date To</label>
                      <input
                        type="date"
                        value={line.service_date_to}
                        onChange={(e) => handleServiceLineChange(index, 'service_date_to', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Place of Service *</label>
                      <select
                        value={line.place_of_service_code}
                        onChange={(e) => handleServiceLineChange(index, 'place_of_service_code', e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {PLACE_OF_SERVICE_CODES.map((pos) => (
                          <option key={pos.value} value={pos.value}>
                            {pos.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Code Type</label>
                      <select
                        value={line.code_type}
                        onChange={(e) => handleServiceLineChange(index, 'code_type', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="CPT">CPT</option>
                        <option value="HCPCS">HCPCS</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {line.code_type} Code * 
                      <span className={getCodeTypeBadge(line.code_type)}>{line.code_type}</span>
                    </label>
                    <input
                      type="text"
                      value={line.cpt_hcpcs_code}
                      onChange={(e) => handleServiceLineChange(index, 'cpt_hcpcs_code', e.target.value)}
                      required
                      className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                        line.cpt_hcpcs_code && !codeValidation.valid 
                          ? 'border-red-300 text-red-900' 
                          : 'border-gray-300'
                      }`}
                      placeholder={line.code_type === 'CPT' ? 'e.g., 99213' : 'e.g., A4253'}
                    />
                    {line.cpt_hcpcs_code && !codeValidation.valid && (
                      <p className="mt-1 text-sm text-red-600">{codeValidation.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Modifier 1</label>
                      <input
                        type="text"
                        value={line.modifier1}
                        onChange={(e) => handleServiceLineChange(index, 'modifier1', e.target.value)}
                        maxLength="2"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Modifier 2</label>
                      <input
                        type="text"
                        value={line.modifier2}
                        onChange={(e) => handleServiceLineChange(index, 'modifier2', e.target.value)}
                        maxLength="2"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diagnosis Pointer</label>
                      <input
                        type="text"
                        value={line.diagnosis_pointer}
                        onChange={(e) => handleServiceLineChange(index, 'diagnosis_pointer', e.target.value)}
                        maxLength="12"
                        placeholder="A,B,C,D"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Charge Amount *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={line.charge_amount}
                        onChange={(e) => handleServiceLineChange(index, 'charge_amount', e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Units</label>
                      <input
                        type="number"
                        min="1"
                        value={line.units}
                        onChange={(e) => handleServiceLineChange(index, 'units', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      {formData.service_lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeServiceLine(index)}
                          className="bg-red-600 text-white px-3 py-2 rounded-md text-sm hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes and Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Coverage Notes</label>
              <textarea
                name="coverage_notes"
                value={formData.coverage_notes}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter coverage details, symptoms, treatment notes..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Claim Info</label>
              <textarea
                name="additional_claim_info"
                value={formData.additional_claim_info}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Additional information for this claim..."
              />
            </div>
          </div>

          {/* AI Suggestions Button */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-blue-900">AI Code Suggestions</h4>
                <p className="text-sm text-blue-700">Get AI-powered ICD-10, CPT, and HCPCS code suggestions based on your notes</p>
              </div>
              <button
                type="button"
                onClick={getAISuggestions}
                disabled={isLoading || (!formData.coverage_notes.trim() && !formData.additional_claim_info.trim())}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Get AI Suggestions'}
              </button>
            </div>
            
            {/* Enhanced AI Suggestions Display with HCPCS */}
            {showAISuggestions && aiSuggestions && (
              <div className="mt-4 space-y-4">
                {/* Best Match Section */}
                {aiSuggestions.best_procedure_match && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-yellow-900 mb-2">🎯 Best Match</h5>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className={`${getCodeTypeBadge(aiSuggestions.best_procedure_match.code_type)} mr-2`}>
                          {aiSuggestions.best_procedure_match.code_type}
                        </span>
                        <span className="font-mono text-sm">{aiSuggestions.best_procedure_match.code}</span>
                        <p className="text-xs text-gray-600 mt-1">{aiSuggestions.best_procedure_match.description}</p>
                        <span className="text-xs text-blue-600">
                          Confidence: {(aiSuggestions.best_procedure_match.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyAISuggestion('procedure', aiSuggestions.best_procedure_match)}
                        className="ml-2 bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                      >
                        Apply Best Match
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ICD-10 Suggestions */}
                  {aiSuggestions.icd_suggestions && aiSuggestions.icd_suggestions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Diagnoses (ICD-10)</h5>
                      <div className="space-y-2">
                        {aiSuggestions.icd_suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-2">ICD10</span>
                                <span className="font-mono text-sm">{suggestion.code}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                              {suggestion.confidence && (
                                <span className="text-xs text-blue-600">
                                  Confidence: {(suggestion.confidence * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => applyAISuggestion('diagnosis', suggestion)}
                              className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* CPT Suggestions */}
                  {aiSuggestions.cpt_suggestions && aiSuggestions.cpt_suggestions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Procedures (CPT)</h5>
                      <div className="space-y-2">
                        {aiSuggestions.cpt_suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">CPT</span>
                                <span className="font-mono text-sm">{suggestion.code}</span>
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                              {suggestion.confidence && (
                                <span className="text-xs text-blue-600">
                                  Confidence: {(suggestion.confidence * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => applyAISuggestion('procedure', { ...suggestion, code_type: 'CPT' })}
                              className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* HCPCS Suggestions */}
                  {aiSuggestions.hcpcs_suggestions && aiSuggestions.hcpcs_suggestions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Healthcare Items (HCPCS)</h5>
                      <div className="space-y-2">
                        {aiSuggestions.hcpcs_suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded p-2">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">HCPCS</span>
                                <span className="font-mono text-sm">{suggestion.code}</span>
                                {suggestion.category && (
                                  <span className="bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded ml-1">
                                    {suggestion.category}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                              {suggestion.confidence && (
                                <span className="text-xs text-blue-600">
                                  Confidence: {(suggestion.confidence * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => applyAISuggestion('procedure', { ...suggestion, code_type: 'HCPCS' })}
                              className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Charge</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="total_charge"
                value={formData.total_charge}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="amount_paid"
                value={formData.amount_paid}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Balance Due</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="balance_due"
                value={formData.balance_due}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Condition Related Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="condition_employment_related"
                checked={formData.condition_employment_related}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Employment Related
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="condition_auto_accident"
                checked={formData.condition_auto_accident}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Auto Accident
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="condition_other_accident"
                checked={formData.condition_other_accident}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Other Accident
              </label>
            </div>
          </div>

          {/* Auto Accident State (conditional) */}
          {formData.condition_auto_accident && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Auto Accident State</label>
                <input
                  type="text"
                  name="condition_auto_accident_state"
                  value={formData.condition_auto_accident_state}
                  onChange={handleInputChange}
                  maxLength="2"
                  placeholder="CA"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : (editingClaim ? 'Update Claim' : 'Create Claim')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClaimForm;