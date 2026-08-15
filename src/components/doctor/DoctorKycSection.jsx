import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import { paymentService } from '../../services/paymentApi';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function DoctorKycAndBankingPage() {
  const [doctorId, setDoctorId] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState('unsubmitted'); // 'unsubmitted' | 'pending' | 'verified' | 'rejected'
  const [actionLoading, setActionLoading] = useState(false);
  const [status, setStatus] = useState({ error: null, success: null });

  // Bank Account Settings State
  const [bankData, setBankData] = useState({
    account_number: '',
    beneficiary_name: '',
    ifsc_code: ''
  });

  // KYC Submission Form State
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

  const fetchLiveKycStatus = async (id) => {
    try {
      const res = await paymentService.getOnboardingStatus(id);
      if (res.data?.success) {
        const currentStatus = res.data.kyc_status || res.data.account?.kyc?.status || 'pending';
        setKycStatus(currentStatus);
      } else {
        setKycStatus('unsubmitted');
      }
    } catch (err) {
      // If 401 or "Doctor not onboarded yet", explicitly set to unsubmitted so form displays
      if (err.response?.status === 401 || err.response?.data?.message?.toLowerCase().includes('not onboarded')) {
        setKycStatus('unsubmitted');
      } else {
        setKycStatus('unsubmitted');
      }
    }
  };

  // 1. Fetch Doctor Profile & Bank Data internally on page load
  const loadDoctorProfileData = async () => {
    setPageLoading(true);
    setStatus({ error: null, success: null });
    try {
      const res = await doctorService.getUserData();
      const user = res.data?.userData || {};
      const profile = user.doctorProfile || {};
      const currentDoctorId = profile.id || user.id;

      if (currentDoctorId) {
        setDoctorId(currentDoctorId);
        
        // Populate initial bank details
        setBankData({
          account_number: profile.account_number || '',
          beneficiary_name: profile.beneficiary_name || '',
          ifsc_code: profile.ifsc_code || ''
        });

        // Pre-fill parts of KYC form from profile
        setKycForm(prev => ({
          ...prev,
          contact_name: user.username || prev.contact_name,
          beneficiary_name: profile.beneficiary_name || prev.beneficiary_name,
          account_number: profile.account_number || prev.account_number,
          ifsc_code: profile.ifsc_code || prev.ifsc_code
        }));

        // Immediately check live onboarding status
        await fetchLiveKycStatus(currentDoctorId);
      }
    } catch (err) {
      setStatus({ 
        error: err.response?.data?.message || 'Failed to retrieve profile banking parameters.', 
        success: null 
      });
      setKycStatus('unsubmitted');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorProfileData();
  }, []);

  const handleKycChange = (e) => {
    const { name, value } = e.target;
    setKycForm(prev => ({ ...prev, [name]: value }));
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId) return;
    setStatus({ error: null, success: null });
    setActionLoading(true);

    try {
      const res = await paymentService.startOnboarding(doctorId, kycForm);
      if (res.data?.success) {
        setKycStatus(res.data.kyc_status || 'pending');
        setStatus({
          error: null,
          success: 'KYC details submitted successfully! Verification is currently in review.'
        });
      }
    } catch (err) {
      setStatus({
        error: err.response?.data?.message || 'KYC submission failed. Please verify the submitted data.',
        success: null
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: null, success: null });
    setActionLoading(true);
    try {
      await doctorService.uploadBankDetails(bankData);
      setStatus({ error: null, success: 'Bank settlement details updated successfully.' });
    } catch (err) {
      setStatus({ error: err.response?.data?.message || 'Failed to update bank details.', success: null });
    } finally {
      setActionLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10 space-y-8">
      {/* 1. Settlement Banking Setup */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Payout Settlement Bank Account
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure the bank account where completed consultation fees are deposited.
          </p>
        </div>

        <form onSubmit={handleBankSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
          <InputField 
            label="Beneficiary Name" 
            value={bankData.beneficiary_name} 
            onChange={(e) => setBankData({ ...bankData, beneficiary_name: e.target.value })} 
            placeholder="e.g. Dr. Prabhas" 
            required 
          />
          <InputField 
            label="Account Number" 
            value={bankData.account_number} 
            onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })} 
            placeholder="222222222222" 
            required 
          />
          <InputField 
            label="IFSC Code" 
            value={bankData.ifsc_code} 
            onChange={(e) => setBankData({ ...bankData, ifsc_code: e.target.value })} 
            placeholder="HDFC0000001" 
            required 
          />
          <div className="sm:col-span-3 flex justify-end">
            <button 
              type="submit" 
              disabled={actionLoading}
              className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition disabled:opacity-50"
            >
              {actionLoading ? 'Updating...' : 'Save Bank Details'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Razorpay KYC Compliance Card */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Razorpay KYC Compliance
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete merchant identity checks to release automated consultation payouts.
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
            <h4 className="text-xs font-bold text-emerald-800">Account Fully Verified</h4>
            <p className="text-xs text-emerald-600">
              Your identity and banking credentials are confirmed. Settlements will process automatically.
            </p>
          </div>
        )}

        {kycStatus === 'pending' && (
          <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-xl text-center space-y-2">
            <h4 className="text-xs font-bold text-amber-800">Verification Under Review</h4>
            <p className="text-xs text-amber-600">
              Razorpay compliance checks are currently being processed.
            </p>
            <button
              type="button"
              onClick={() => fetchLiveKycStatus(doctorId)}
              className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition"
            >
              Refresh Verification Status
            </button>
          </div>
        )}

        {(kycStatus === 'unsubmitted' || kycStatus === 'rejected') && (
          <form onSubmit={handleKycSubmit} className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase">1. Business & Identification</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Legal Business Name" name="legal_business_name" value={kycForm.legal_business_name} onChange={handleKycChange} placeholder="Dr. Prabhas Clinic" required />
                <InputField label="Contact Person Name" name="contact_name" value={kycForm.contact_name} onChange={handleKycChange} placeholder="Dr. Prabhas" required />
                <InputField label="Business PAN" name="business_pan" value={kycForm.business_pan} onChange={handleKycChange} placeholder="ABCDE1234F" required />
                <InputField label="Personal PAN (Stakeholder)" name="personal_pan" value={kycForm.personal_pan} onChange={handleKycChange} placeholder="ABCDE1234F" required />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase">2. Practice Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Address Line 1" name="address_line1" value={kycForm.address_line1} onChange={handleKycChange} placeholder="Room 201, Clinic Hub" required />
                <InputField label="City" name="city" value={kycForm.city} onChange={handleKycChange} placeholder="Warangal" required />
                <InputField label="State" name="state" value={kycForm.state} onChange={handleKycChange} placeholder="Telangana" required />
                <InputField label="Postal Code" name="postal_code" value={kycForm.postal_code} onChange={handleKycChange} placeholder="506002" required />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase">3. Razorpay Settlement Account</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Beneficiary Name" name="beneficiary_name" value={kycForm.beneficiary_name} onChange={handleKycChange} placeholder="Dr. Prabhas" required />
                <InputField label="Account Number" name="account_number" value={kycForm.account_number} onChange={handleKycChange} placeholder="222222222222" required />
                <InputField label="IFSC Code" name="ifsc_code" value={kycForm.ifsc_code} onChange={handleKycChange} placeholder="HDFC0000001" required />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {actionLoading ? 'Submitting Data...' : 'Submit KYC for Activation'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}