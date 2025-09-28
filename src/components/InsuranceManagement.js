import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { INSURANCE_TYPE_OPTIONS, GENDER_OPTIONS, formatDate } from '../config/api';

const InsuranceManagement = () => {
  const { apiCall, hasPermission } = useAuth();
  const [insurances, setInsurances] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [insuranceData, patientData] = await Promise.all([
        apiCall('/insurances'),
        apiCall('/patients')
      ]);
      setInsurances(Array.isArray(insuranceData) ? insuranceData : []);
      setPatients(Array.isArray(patientData) ? patientData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load insurance data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Management</h1>
          <p className="text-gray-600">Manage patient insurance information</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Insurance Policies ({insurances.length})
          </h3>
        </div>
        
        {insurances.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No insurance policies found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurance Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan Name</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insurances.map((insurance) => {
                  const patient = patients.find(p => p.patient_id === insurance.patient_id);
                  return (
                    <tr key={insurance.insurance_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {insurance.insurance_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {insurance.policy_number || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {insurance.plan_name || 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceManagement;