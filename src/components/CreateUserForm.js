import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Award, Shield, Eye, EyeOff, X, AlertCircle, CheckCircle } from 'lucide-react';

const CreateUserForm = ({ onClose, onSuccess, editingUser = null, apiCall }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });

  // User roles based on your schema
  const USER_ROLES = [
    { value: 'ADMIN', label: 'Administrator', description: 'Full system access' },
    { value: 'MEDICAL_STAFF', label: 'Medical Staff', description: 'Doctors, nurses, medical professionals' },
    { value: 'INSURANCE_STAFF', label: 'Insurance Staff', description: 'Insurance company representatives' },
    { value: 'BILLING_STAFF', label: 'Billing Staff', description: 'Billing and administrative staff' }
  ];

  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Information
    first_name: '',
    last_name: '',
    middle_initial: '',
    
    // Role and Status
    role: 'MEDICAL_STAFF',
    is_active: true,
    is_verified: false,
    
    // Contact Information
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    
    // Professional Information (for medical staff)
    npi: '',
    license_number: '',
    specialty: '',
    organization: '',
    
    // Insurance Staff Information
    insurance_company: ''
  });

  // Medical specialties for dropdown
  const MEDICAL_SPECIALTIES = [
    'Internal Medicine', 'Family Medicine', 'Pediatrics', 'Cardiology', 'Dermatology',
    'Emergency Medicine', 'Orthopedics', 'Radiology', 'Anesthesiology', 'Surgery',
    'Psychiatry', 'Neurology', 'Oncology', 'Ophthalmology', 'Gynecology',
    'Urology', 'Pathology', 'Physical Medicine', 'Other'
  ];

  useEffect(() => {
    if (editingUser) {
      populateEditForm();
    }
  }, [editingUser]);

  const populateEditForm = () => {
    if (!editingUser) return;
    
    setFormData({
      ...editingUser,
      password: '', // Don't populate password for security
      confirmPassword: '',
      // Ensure proper date formatting
      created_at: editingUser.created_at ? new Date(editingUser.created_at).toISOString().split('T')[0] : '',
    });
  };

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    const feedback = [];
    
    if (!checks.length) feedback.push('At least 8 characters');
    if (!checks.lowercase) feedback.push('One lowercase letter');
    if (!checks.uppercase) feedback.push('One uppercase letter');
    if (!checks.numbers) feedback.push('One number');
    if (!checks.special) feedback.push('One special character');
    
    return { score, feedback, checks };
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate password strength
    if (name === 'password') {
      setPasswordStrength(validatePassword(value));
    }

    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Required fields validation
    const requiredFields = ['username', 'email', 'first_name', 'last_name', 'role'];
    
    if (!editingUser) {
      requiredFields.push('password', 'confirmPassword');
    }
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return `${field.replace('_', ' ').charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')} is required`;
      }
    }

    // Username validation
    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Password validation (only for new users or if password is provided for updates)
    if (!editingUser || formData.password) {
      if (formData.password.length < 6) {
        return 'Password must be at least 6 characters long';
      }
      
      const { checks } = validatePassword(formData.password);
      if (!checks.uppercase || !checks.lowercase || !checks.numbers) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
      
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match';
      }
    }

    // NPI validation for medical staff
    if (formData.role === 'MEDICAL_STAFF' && formData.npi) {
      if (!/^\d{10}$/.test(formData.npi)) {
        return 'NPI must be exactly 10 digits';
      }
    }

    // Phone validation
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      return 'Please enter a valid phone number';
    }

    // ZIP code validation
    if (formData.zip_code && !/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
      return 'Please enter a valid ZIP code (12345 or 12345-6789)';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Remove confirm password as it's not needed by API
        confirmPassword: undefined,
        // Convert empty strings to null for optional fields
        middle_initial: formData.middle_initial || null,
        npi: formData.npi || null,
        license_number: formData.license_number || null,
        specialty: formData.specialty || null,
        organization: formData.organization || null,
        insurance_company: formData.insurance_company || null,
        address_line2: formData.address_line2 || null,
      };

      // Remove password if not provided in edit mode
      if (editingUser && !formData.password) {
        delete submitData.password;
      }

      let result;
      if (editingUser) {
        // Update existing user
        result = await apiCall(`/users/${editingUser.user_id}`, {
          method: 'PUT',
          body: JSON.stringify(submitData)
        });
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        result = await apiCall('/users', {
          method: 'POST',
          body: JSON.stringify(submitData)
        });
        setSuccess('User created successfully!');
      }

      // Wait a moment to show success message, then close
      setTimeout(() => {
        onSuccess(result);
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error submitting user:', error);
      setError(error.message || 'Failed to save user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (score) => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            {editingUser ? 'Edit User' : 'Create New User'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  minLength="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 
                          <EyeOff className="h-4 w-4 text-gray-400" /> : 
                          <Eye className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded">
                            <div 
                              className={`h-full rounded transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            passwordStrength.score < 2 ? 'text-red-600' : 
                            passwordStrength.score < 4 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {getPasswordStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <div className="mt-1 text-xs text-gray-600">
                            Missing: {passwordStrength.feedback.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? 
                          <EyeOff className="h-4 w-4 text-gray-400" /> : 
                          <Eye className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="First name"
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
                  placeholder="Last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Middle Initial</label>
                <input
                  type="text"
                  name="middle_initial"
                  value={formData.middle_initial}
                  onChange={handleInputChange}
                  maxLength="1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="M"
                />
              </div>
            </div>
          </div>

          {/* Role and Status Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Role & Status
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {USER_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {USER_ROLES.find(r => r.value === formData.role)?.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Active User
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_verified"
                    checked={formData.is_verified}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Email Verified
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Contact Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input
                  type="text"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="123 Main St"
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
                  placeholder="Apt 4B"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="New York"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  maxLength="2"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          {(formData.role === 'MEDICAL_STAFF' || formData.role === 'INSURANCE_STAFF') && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Professional Information
              </h4>
              
              {formData.role === 'MEDICAL_STAFF' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">NPI Number</label>
                    <input
                      type="text"
                      name="npi"
                      value={formData.npi}
                      onChange={handleInputChange}
                      maxLength="10"
                      pattern="[0-9]{10}"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="1234567890"
                    />
                    <p className="mt-1 text-xs text-gray-500">10-digit National Provider Identifier</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">License Number</label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter license number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medical Specialty</label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select specialty</option>
                      {MEDICAL_SPECIALTIES.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Hospital or clinic name"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurance Company</label>
                  <input
                    type="text"
                    name="insurance_company"
                    value={formData.insurance_company}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter insurance company name"
                  />
                </div>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                editingUser ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;