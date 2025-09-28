// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  USERS: '/auth/users',
  
  // Core resources
  PATIENTS: '/patients',
  PROVIDERS: '/providers',
  CLAIMS: '/claims',
  INSURANCES: '/insurances',
  DOCUMENTS: '/claim-documents',
  SEGMENTS: '/segments',
  
  // AI services
  AI_SUGGEST_CODES: '/ai/suggest-codes',
  AI_ANALYZE_CLAIM: '/ai/analyze-claim',
  AI_SEARCH_CODES: '/ai/search-codes',
  AI_HEALTH: '/ai/health',
  
  // Code lookup services (new)
  CODES_SEARCH: '/codes/search',
  CODES_ICD10: '/codes/icd10',
  CODES_CPT: '/codes/cpt',
  CODES_HCPCS: '/codes/hcpcs',
  
  // Health check
  HEALTH: '/health',
};

// Code type options (new)
export const CODE_TYPES = [
  { value: 'CPT', label: 'CPT (Current Procedural Terminology)', color: 'bg-blue-100 text-blue-800' },
  { value: 'HCPCS', label: 'HCPCS (Healthcare Common Procedure Coding System)', color: 'bg-green-100 text-green-800' },
  { value: 'ICD10', label: 'ICD-10 (International Classification of Diseases)', color: 'bg-purple-100 text-purple-800' }
];

// HCPCS categories for better organization (new)
export const HCPCS_CATEGORIES = {
  'A': { name: 'Transportation Services, Medical and Surgical Supplies', color: 'bg-red-100 text-red-800' },
  'B': { name: 'Enteral and Parenteral Therapy', color: 'bg-orange-100 text-orange-800' },
  'C': { name: 'Outpatient PPS', color: 'bg-yellow-100 text-yellow-800' },
  'D': { name: 'Dental Procedures', color: 'bg-green-100 text-green-800' },
  'E': { name: 'Durable Medical Equipment', color: 'bg-blue-100 text-blue-800' },
  'G': { name: 'Procedures/Professional Services (Temporary)', color: 'bg-indigo-100 text-indigo-800' },
  'H': { name: 'Alcohol and Drug Abuse Treatment Services', color: 'bg-purple-100 text-purple-800' },
  'J': { name: 'Drugs Administered Other than Oral Method', color: 'bg-pink-100 text-pink-800' },
  'K': { name: 'Temporary Codes', color: 'bg-gray-100 text-gray-800' },
  'L': { name: 'Orthotic/Prosthetic Procedures', color: 'bg-red-100 text-red-800' },
  'M': { name: 'Medical Services', color: 'bg-orange-100 text-orange-800' },
  'P': { name: 'Pathology and Laboratory Services', color: 'bg-yellow-100 text-yellow-800' },
  'Q': { name: 'Temporary Codes', color: 'bg-green-100 text-green-800' },
  'R': { name: 'Diagnostic Radiology Services', color: 'bg-blue-100 text-blue-800' },
  'S': { name: 'Temporary National Codes', color: 'bg-indigo-100 text-indigo-800' },
  'T': { name: 'National T Codes', color: 'bg-purple-100 text-purple-800' },
  'V': { name: 'Vision Services', color: 'bg-pink-100 text-pink-800' }
};

// Status options for claims
export const CLAIM_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'SUBMITTED', label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_PROCESS', label: 'In Process', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'DENIED', label: 'Denied', color: 'bg-red-100 text-red-800' },
  { value: 'PAID', label: 'Paid', color: 'bg-green-100 text-green-800' },
  { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'PENDING', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
];

// Insurance type options
export const INSURANCE_TYPE_OPTIONS = [
  { value: 'MEDICARE', label: 'Medicare' },
  { value: 'MEDICAID', label: 'Medicaid' },
  { value: 'TRICARE', label: 'TRICARE' },
  { value: 'CHAMPVA', label: 'CHAMPVA' },
  { value: 'GROUP_HEALTH', label: 'Group Health Plan' },
  { value: 'FECA', label: 'FECA' },
  { value: 'OTHER', label: 'Other' },
];

// Gender options
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'X', label: 'Other' },
];

// Relationship options
export const RELATIONSHIP_OPTIONS = [
  { value: 'SELF', label: 'Self' },
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'CHILD', label: 'Child' },
  { value: 'OTHER', label: 'Other' },
];

// User roles
export const USER_ROLES = [
  { value: 'ADMIN', label: 'Administrator' },
  { value: 'MEDICAL_STAFF', label: 'Medical Staff' },
  { value: 'INSURANCE_STAFF', label: 'Insurance Staff' },
  { value: 'BILLING_STAFF', label: 'Billing Staff' },
];

// US States for forms
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

// Common place of service codes
export const PLACE_OF_SERVICE_CODES = [
  { value: '11', label: '11 - Office' },
  { value: '12', label: '12 - Home' },
  { value: '21', label: '21 - Inpatient Hospital' },
  { value: '22', label: '22 - Outpatient Hospital' },
  { value: '23', label: '23 - Emergency Room' },
  { value: '24', label: '24 - Ambulatory Surgical Center' },
  { value: '25', label: '25 - Birthing Center' },
  { value: '26', label: '26 - Military Treatment Facility' },
  { value: '31', label: '31 - Skilled Nursing Facility' },
  { value: '32', label: '32 - Nursing Facility' },
  { value: '33', label: '33 - Custodial Care Facility' },
  { value: '34', label: '34 - Hospice' },
  { value: '41', label: '41 - Ambulance - Land' },
  { value: '42', label: '42 - Ambulance - Air or Water' },
  { value: '49', label: '49 - Independent Clinic' },
  { value: '50', label: '50 - Federally Qualified Health Center' },
  { value: '51', label: '51 - Inpatient Psychiatric Facility' },
  { value: '52', label: '52 - Psychiatric Facility-Partial Hospitalization' },
  { value: '53', label: '53 - Community Mental Health Center' },
  { value: '54', label: '54 - Intermediate Care Facility/Mentally Retarded' },
  { value: '55', label: '55 - Residential Substance Abuse Treatment Facility' },
  { value: '56', label: '56 - Psychiatric Residential Treatment Center' },
  { value: '57', label: '57 - Non-residential Substance Abuse Treatment Facility' },
  { value: '60', label: '60 - Mass Immunization Center' },
  { value: '61', label: '61 - Comprehensive Inpatient Rehabilitation Facility' },
  { value: '62', label: '62 - Comprehensive Outpatient Rehabilitation Facility' },
  { value: '65', label: '65 - End-Stage Renal Disease Treatment Facility' },
  { value: '71', label: '71 - Public Health Clinic' },
  { value: '72', label: '72 - Rural Health Clinic' },
  { value: '81', label: '81 - Independent Laboratory' },
  { value: '99', label: '99 - Other Place of Service' },
];

// Document types for claim documents
export const DOCUMENT_TYPES = [
  { value: 'MEDICAL_RECORDS', label: 'Medical Records' },
  { value: 'LAB_RESULTS', label: 'Lab Results' },
  { value: 'X_RAY', label: 'X-Ray' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'INSURANCE_CARD', label: 'Insurance Card' },
  { value: 'ID_CARD', label: 'ID Card' },
  { value: 'AUTHORIZATION', label: 'Authorization' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'OPERATIVE_REPORT', label: 'Operative Report' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'PATHOLOGY_REPORT', label: 'Pathology Report' },
  { value: 'OTHER', label: 'Other' },
];

// Code validation functions (new)
export const validateCode = (code, codeType) => {
  if (!code || !code.trim()) {
    return { valid: false, message: 'Code is required' };
  }

  const cleanCode = code.trim().toUpperCase();

  switch (codeType) {
    case 'CPT':
      if (!/^\d{5}$/.test(cleanCode)) {
        return { valid: false, message: 'CPT codes must be exactly 5 digits' };
      }
      break;
      
    case 'HCPCS':
      if (!/^[A-Z]\d{4}/.test(cleanCode)) {
        return { valid: false, message: 'HCPCS codes must start with a letter followed by 4+ digits' };
      }
      break;
      
    case 'ICD10':
      if (!/^[A-Z]\d{2}\.?\d*[A-Z]?$/.test(cleanCode)) {
        return { valid: false, message: 'Invalid ICD-10 format (e.g., A00.0, B15.9)' };
      }
      break;
      
    default:
      return { valid: false, message: 'Unknown code type' };
  }

  return { valid: true, message: 'Valid code format' };
};

// Auto-detect code type based on format (new)
export const detectCodeType = (code) => {
  if (!code) return 'CPT';
  
  const cleanCode = code.trim().toUpperCase();
  
  // HCPCS codes typically start with a letter
  if (/^[A-Z]/.test(cleanCode)) {
    return 'HCPCS';
  }
  
  // CPT codes are typically 5 digits
  if (/^\d{5}$/.test(cleanCode)) {
    return 'CPT';
  }
  
  // ICD-10 codes have specific format
  if (/^[A-Z]\d{2}\./.test(cleanCode)) {
    return 'ICD10';
  }
  
  return 'CPT'; // Default
};

// Get HCPCS category info (new)
export const getHCPCSCategory = (code) => {
  if (!code || code.length === 0) return null;
  const firstLetter = code[0].toUpperCase();
  return HCPCS_CATEGORIES[firstLetter] || null;
};

// Utility functions
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US');
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  return new Date(dateTime).toLocaleString('en-US');
};

// Format code with type badge (new)
export const formatCodeWithBadge = (code, codeType) => {
  const typeInfo = CODE_TYPES.find(t => t.value === codeType);
  const badgeColor = typeInfo ? typeInfo.color : 'bg-gray-100 text-gray-800';
  
  return {
    code,
    codeType,
    badgeColor,
    typeLabel: typeInfo ? typeInfo.label.split(' ')[0] : codeType
  };
};