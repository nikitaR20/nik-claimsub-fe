import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { GENDER_OPTIONS, formatDate, US_STATES, INSURANCE_TYPE_OPTIONS } from '../config/api';

const PatientManagement = () => {
  const { apiCall, hasPermission } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('personal'); // personal, contact, address, emergency, insurance

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_initial: '',
    birth_date: '',
    gender: 'M',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    income: '',
    marital_status: '',
    employment_status: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  // Insurance form data - supporting multiple insurance records
  const [insuranceData, setInsuranceData] = useState([]);
  const [showInsuranceForm, setShowInsuranceForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  
  const defaultInsuranceForm = {
    insurance_type: 'GROUP_HEALTH',
    policy_number: '',
    group_number: '',
    plan_name: '',
    insured_name: '',
    insured_dob: '',
    insured_sex: 'M',
    relationship_to_patient: 'SELF',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    effective_date: '',
    termination_date: '',
    condition_employment_related: false,
    condition_auto_accident: false,
    condition_other_accident: false
  };

  const [insuranceForm, setInsuranceForm] = useState(defaultInsuranceForm);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(patient => 
      `${patient.first_name} ${patient.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await apiCall('/patients');
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientInsurances = async (patientId) => {
    try {
      const data = await apiCall(`/patients/${patientId}/insurances`);
      setInsuranceData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading patient insurances:', error);
      setInsuranceData([]);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      middle_initial: '',
      birth_date: '',
      gender: 'M',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      income: '',
      marital_status: '',
      employment_status: '',
      emergency_contact_name: '',
      emergency_contact_phone: ''
    });
    setInsuranceData([]);
    setActiveTab('personal');
  };

  const resetInsuranceForm = () => {
    setInsuranceForm(defaultInsuranceForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInsuranceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInsuranceForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        income: formData.income ? parseFloat(formData.income) : null
      };

      let savedPatient;
      if (editingPatient) {
        savedPatient = await apiCall(`/patients/${editingPatient.patient_id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData)
        });
      } else {
        savedPatient = await apiCall('/patients', {
          method: 'POST',
          body: JSON.stringify(submitData)
        });
      }

      // Save insurance data if any - ONLY after patient is created/updated
      if (insuranceData.length > 0) {
        const patientId = savedPatient.patient_id || editingPatient.patient_id;
        
        // If editing, first delete existing insurances (or handle updates)
        if (editingPatient) {
          // For simplicity, we'll keep existing insurances and only add new ones
          // In a production app, you might want more sophisticated update logic
        }

        // Add new insurances
        for (const insurance of insuranceData) {
          if (!insurance.insurance_id) { // Only add new insurances
            // Clean up insurance data - convert empty strings to null for date fields
            const cleanInsuranceData = {
              ...insurance,
              patient_id: patientId, // Add patient_id to the request body
              insured_dob: insurance.insured_dob || null,
              effective_date: insurance.effective_date || null,
              termination_date: insurance.termination_date || null
            };
            
            await apiCall(`/patients/${patientId}/insurances`, {
              method: 'POST',
              body: JSON.stringify(cleanInsuranceData)
            });
          }
        }
      }

      loadPatients();
      setShowAddForm(false);
      setEditingPatient(null);
      resetForm();
    } catch (error) {
      console.error('Error saving patient:', error);
      setError(error.message || 'Failed to save patient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInsurance = () => {
    setEditingInsurance(null);
    resetInsuranceForm();
    setShowInsuranceForm(true);
  };

  const handleEditInsurance = (index) => {
    setEditingInsurance(index);
    setInsuranceForm(insuranceData[index]);
    setShowInsuranceForm(true);
  };

  const handleDeleteInsurance = (index) => {
    setInsuranceData(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveInsurance = () => {
    if (editingInsurance !== null) {
      // Edit existing
      setInsuranceData(prev => 
        prev.map((item, index) => 
          index === editingInsurance ? insuranceForm : item
        )
      );
    } else {
      // Add new
      setInsuranceData(prev => [...prev, insuranceForm]);
    }
    
    setShowInsuranceForm(false);
    resetInsuranceForm();
    setEditingInsurance(null);
  };

  const handleEdit = async (patient) => {
    setEditingPatient(patient);
    setFormData({
      ...patient,
      birth_date: patient.birth_date ? patient.birth_date.split('T')[0] : '',
      income: patient.income || '',
    });
    
    // Load patient's insurance data
    await loadPatientInsurances(patient.patient_id);
    
    setShowAddForm(true);
  };

  const handleDelete = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) {
      return;
    }

    try {
      await apiCall(`/patients/${patientId}`, { method: 'DELETE' });
      loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient');
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Initial</label>
                <input
                  type="text"
                  name="middle_initial"
                  value={formData.middle_initial}
                  onChange={handleInputChange}
                  maxLength="10"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Birth Date *</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Income</label>
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleInputChange}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Employment Status</label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleInputChange}
                className="mt-1 block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Employed">Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Retired">Retired</option>
                <option value="Student">Student</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'address':
        return (
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Address Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-4">Emergency Contact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'insurance':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Insurance Information</h4>
              <button
                type="button"
                onClick={handleAddInsurance}
                className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
              >
                Add Insurance
              </button>
            </div>

            {insuranceData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No insurance policies added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {insuranceData.map((insurance, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        {insurance.insurance_type.replace('_', ' ')} - {insurance.plan_name || 'Unnamed Plan'}
                      </h5>
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditInsurance(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteInsurance(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Policy Number:</span> {insurance.policy_number || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Group Number:</span> {insurance.group_number || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Relationship:</span> {insurance.relationship_to_patient}
                      </div>
                    </div>
                    {insurance.effective_date && (
                      <div className="text-sm mt-2">
                        <span className="font-medium">Effective:</span> {formatDate(insurance.effective_date)}
                        {insurance.termination_date && (
                          <span> - <span className="font-medium">Ends:</span> {formatDate(insurance.termination_date)}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient information and demographics</p>
        </div>
        {hasPermission('patients:create') && (
          <button
            onClick={() => {
              resetForm();
              setEditingPatient(null);
              setShowAddForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Patient
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Patients</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Patients ({filteredPatients.length})
          </h3>
        </div>
        
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding a new patient'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DOB / Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.patient_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.first_name} {patient.middle_initial && `${patient.middle_initial}. `}{patient.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{formatDate(patient.birth_date)}</div>
                        <div className="text-gray-500">Age: {calculateAge(patient.birth_date)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{patient.phone || 'N/A'}</div>
                        <div className="text-gray-500">{patient.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{patient.address_line1 || 'N/A'}</div>
                        <div className="text-gray-500">
                          {patient.city && patient.state ? `${patient.city}, ${patient.state}` : ''}
                          {patient.zip_code && ` ${patient.zip_code}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {hasPermission('patients:update') && (
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission('patients:delete') && (
                        <button
                          onClick={() => handleDelete(patient.patient_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Patient Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-full max-w-5xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPatient(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'personal', label: 'Personal', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  { id: 'address', label: 'Address', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                  { id: 'emergency', label: 'Emergency', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5C3.498 18.333 4.46 20 6 20z' },
                  { id: 'insurance', label: 'Insurance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {renderTabContent()}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingPatient(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : (editingPatient ? 'Update Patient' : 'Add Patient')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insurance Form Modal */}
      {showInsuranceForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" style={{ zIndex: 9999 }}>
          <div className="relative top-8 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                {editingInsurance !== null ? 'Edit Insurance' : 'Add Insurance'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowInsuranceForm(false);
                  resetInsuranceForm();
                  setEditingInsurance(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Insurance Info */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Insurance Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insurance Type *</label>
                    <select
                      name="insurance_type"
                      value={insuranceForm.insurance_type}
                      onChange={handleInsuranceInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {INSURANCE_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                    <input
                      type="text"
                      name="plan_name"
                      value={insuranceForm.plan_name}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Policy Number</label>
                    <input
                      type="text"
                      name="policy_number"
                      value={insuranceForm.policy_number}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Group Number</label>
                    <input
                      type="text"
                      name="group_number"
                      value={insuranceForm.group_number}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Insured Person Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Insured Person Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insured Name</label>
                    <input
                      type="text"
                      name="insured_name"
                      value={insuranceForm.insured_name}
                      onChange={handleInsuranceInputChange}
                      placeholder="Leave empty if same as patient"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Relationship to Patient</label>
                    <select
                      name="relationship_to_patient"
                      value={insuranceForm.relationship_to_patient}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="SELF">Self</option>
                      <option value="SPOUSE">Spouse</option>
                      <option value="CHILD">Child</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insured Date of Birth</label>
                    <input
                      type="date"
                      name="insured_dob"
                      value={insuranceForm.insured_dob}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Insured Gender</label>
                    <select
                      name="insured_sex"
                      value={insuranceForm.insured_sex}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Coverage Dates */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Coverage Period</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Effective Date</label>
                    <input
                      type="date"
                      name="effective_date"
                      value={insuranceForm.effective_date}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Termination Date</label>
                    <input
                      type="date"
                      name="termination_date"
                      value={insuranceForm.termination_date}
                      onChange={handleInsuranceInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Condition Related Checkboxes */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Condition Related To</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="condition_employment_related"
                      checked={insuranceForm.condition_employment_related}
                      onChange={handleInsuranceInputChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Employment Related</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="condition_auto_accident"
                      checked={insuranceForm.condition_auto_accident}
                      onChange={handleInsuranceInputChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto Accident</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="condition_other_accident"
                      checked={insuranceForm.condition_other_accident}
                      onChange={handleInsuranceInputChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Other Accident</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowInsuranceForm(false);
                    resetInsuranceForm();
                    setEditingInsurance(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInsurance}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingInsurance !== null ? 'Update Insurance' : 'Add Insurance'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;