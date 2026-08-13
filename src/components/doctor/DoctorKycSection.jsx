// src/components/doctor/DoctorKycSection.jsx

import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentApi';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function DoctorKycSection({ doctorId }) {
  const [kycStatus, setKycStatus] = useState('unsubmitted'); // unsubmitted | pending | verified | rejected
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ error: null, success: null });

  const [kycForm, setKycForm] = useState({
    legal_business_name: '',
    contact_name: '',
    business_type: 'individual',
    subcategory: 'healthcare',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    business_pan: '',
    gst_number: '',
    personal_pan: '',
    beneficiary_name: '',
    account_number: '',
    ifsc_code: ''
  });

  useEffect(() => {
    if (doctorId) {
      checkKycStatus();
    }
  }, [doctorId]);

  const checkKycStatus = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getOnboardingStatus(doctorId);
      if (res.data?.success) {
        // Reads local database or Razorpay account status
        const currentStatus = res.data.kyc_status || res.data.account?.kyc?.status || 'pending';
        setKycStatus(currentStatus);
      }
    } catch (err) {
      setKycStatus('unsubmitted');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setKycForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: null, success: null });
    setLoading(true);

    try {
      const res = await paymentService.startOnboarding(doctorId, kycForm);
      if (res.data?.success) {
        setKycStatus(res.data.kyc_status || 'pending');
        setStatus({
          error: null,
          success: 'KYC onboarding details submitted successfully! Verification is under review.'
        });
      }
    } catch (err) {
      setStatus({
        error: err.response?.data?.message || 'KYC submission failed. Please check parameters.',
        success: null
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && kycStatus === 'unsubmitted') return <Loader />;

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Razorpay Banking & KYC Verification
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Onboard your banking details to enable direct patient appointment payout settlements.
          </p>
        </div>
        <div>
          {kycStatus === 'verified' && (
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-full border border-emerald-200">
              ✅ KYC Verified
            </span>
          )}
          {kycStatus === 'pending' && (
            <span className="px-3 py-1 bg-amber-50 text-amber-600 font-bold text-xs rounded-full border border-amber-200">
              ⏳ Verification Pending
            </span>
          )}
          {kycStatus === 'rejected' && (
            <span className="px-3 py-1 bg-rose-50 text-rose-600 font-bold text-xs rounded-full border border-rose-200">
              ❌ KYC Rejected
            </span>
          )}
          {kycStatus === 'unsubmitted' && (
            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full border border-slate-200">
              Not Submitted
            </span>
          )}
        </div>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />

      {kycStatus === 'verified' && (
        <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-xl text-center space-y-1">
          <h4 className="text-xs font-bold text-emerald-800">Account Fully Activated</h4>
          <p className="text-xs text-emerald-600">
            Your bank details and PAN are verified. Consultation fees will automatically route to your account.
          </p>
        </div>
      )}

      {kycStatus === 'pending' && (
        <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-xl text-center space-y-2">
          <h4 className="text-xs font-bold text-amber-800">Verification Under Review</h4>
          <p className="text-xs text-amber-600">
            Banking compliance checks are in progress. Updates will reflect automatically upon completion.
          </p>
          <button
            type="button"
            onClick={checkKycStatus}
            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition"
          >
            Check Live Status
          </button>
        </div>
      )}

      {(kycStatus === 'unsubmitted' || kycStatus === 'rejected') && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase">1. Business & Identification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Legal Business Name" name="legal_business_name" value={kycForm.legal_business_name} onChange={handleChange} placeholder="Dr. Smith Clinic" required />
              <InputField label="Contact Person Name" name="contact_name" value={kycForm.contact_name} onChange={handleChange} placeholder="Jonathan Smith" required />
              <InputField label="Business PAN" name="business_pan" value={kycForm.business_pan} onChange={handleChange} placeholder="ABCDE1234F" required />
              <InputField label="Personal PAN (Stakeholder)" name="personal_pan" value={kycForm.personal_pan} onChange={handleChange} placeholder="ABCDE1234F" required />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase">2. Address Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Address Line 1" name="address_line1" value={kycForm.address_line1} onChange={handleChange} placeholder="Clinic 404, Main St" required />
              <InputField label="City" name="city" value={kycForm.city} onChange={handleChange} placeholder="Warangal" required />
              <InputField label="State" name="state" value={kycForm.state} onChange={handleChange} placeholder="Telangana" required />
              <InputField label="Postal Code" name="postal_code" value={kycForm.postal_code} onChange={handleChange} placeholder="506002" required />
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase">3. Settlement Bank Account</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField label="Beneficiary Name" name="beneficiary_name" value={kycForm.beneficiary_name} onChange={handleChange} placeholder="JONATHAN SMITH" required />
              <InputField label="Account Number" name="account_number" value={kycForm.account_number} onChange={handleChange} placeholder="9182736450" required />
              <InputField label="IFSC Code" name="ifsc_code" value={kycForm.ifsc_code} onChange={handleChange} placeholder="HDFC0000123" required />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Submitting Onboarding Data...' : 'Submit KYC & Onboard for Settlements'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}