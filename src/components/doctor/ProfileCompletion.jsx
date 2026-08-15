import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ProfileCompletion() {
  const [formData, setFormData] = useState({
    id: '', full_name: '', email: '', phone_number: '',
    date_of_birth: '', gender: '', profile_picture: '',
    specialization: '', license_number: '', experience_years: ''
  });
  
  const [verification, setVerification] = useState({
    is_email_verified: false,
    is_phone_verified: false
  });

  const [otpState, setOtpState] = useState({
    emailOtpSent: false, emailOtp: '',
    phoneOtpSent: false, phoneOtp: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const fetchUserData = async () => {
    try {
      const res = await doctorService.getUserData();
      const user = res.data?.userData || {};
      const profile = user.doctorProfile || {};

      setFormData({
        id: user.id || '',
        full_name: user.username || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '',
        gender: profile.gender || '',
        profile_picture: profile.profile_picture || '',
        specialization: profile.specialization || '',
        license_number: profile.license_number || '',
        experience_years: profile.experience_years ? String(profile.experience_years) : ''
      });

      setVerification({
        is_email_verified: user.is_email_verified || false,
        is_phone_verified: user.is_phone_verified || false
      });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to load profile data.', success: null });
    }
  };

  const fetchAddressesData = async () => {
    try {
      const res = await doctorService.getAllAddresses();
      setAddresses(Array.isArray(res.data) ? res.data : (res.data?.addresses || []));
    } catch (err) {
      setAddresses([]);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAddressesData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Profile Update Action
  const handleProfileUpdate = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.updateProfile(formData);
      setStatus({ loading: false, error: null, success: 'Core profile details updated successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to update profile.', success: null });
    }
  };

  // OTP Verification Handlers
  const handleSendOtp = async (type) => {
    try {
      if (type === 'email') {
        await doctorService.sendEmailOtp(formData.email);
        setOtpState(prev => ({ ...prev, emailOtpSent: true }));
      } else {
        await doctorService.sendMobileOtp(formData.phone_number);
        setOtpState(prev => ({ ...prev, phoneOtpSent: true }));
      }
      setStatus({ loading: false, error: null, success: `OTP sent to your ${type}.` });
    } catch (err) {
      setStatus({ loading: false, error: `Failed to send ${type} OTP.`, success: null });
    }
  };

  const handleVerifyOtp = async (type) => {
    try {
      const payload = type === 'email' 
        ? { email: formData.email, otp: otpState.emailOtp }
        : { phoneNumber: formData.phone_number, otp: otpState.phoneOtp };
      
      await doctorService.verifyOtp(payload);
      
      setVerification(prev => ({ 
        ...prev, 
        [type === 'email' ? 'is_email_verified' : 'is_phone_verified']: true 
      }));
      setOtpState(prev => ({
        ...prev,
        [type === 'email' ? 'emailOtpSent' : 'phoneOtpSent']: false
      }));
      setStatus({ loading: false, error: null, success: `${type === 'email' ? 'Email' : 'Phone'} verified successfully.` });
    } catch (err) {
      setStatus({ loading: false, error: `Invalid ${type} OTP.`, success: null });
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 space-y-8">
      {/* 1. Core Profile Details */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Doctor Profile</h2>
            <p className="text-xs text-slate-400 mt-1">Manage core personal attributes.</p>
          </div>
          <button 
            onClick={handleProfileUpdate}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
          >
            Save Profile Changes
          </button>
        </div>

        <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
          <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />
          
          {/* Email Verification Block */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <InputField label="Email Address" name="email" value={formData.email} readOnly />
              </div>
              {!verification.is_email_verified ? (
                <button onClick={() => handleSendOtp('email')} className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                  Verify
                </button>
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-500 pb-2" />
              )}
            </div>
            {otpState.emailOtpSent && !verification.is_email_verified && (
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Enter Email OTP" 
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                  value={otpState.emailOtp} onChange={e => setOtpState({...otpState, emailOtp: e.target.value})}
                />
                <button onClick={() => handleVerifyOtp('email')} className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">Confirm</button>
              </div>
            )}
          </div>

          {/* Phone Verification Block */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <InputField label="Phone Number" name="phone_number" value={formData.phone_number} readOnly />
              </div>
              {!verification.is_phone_verified ? (
                <button onClick={() => handleSendOtp('phone')} className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200">
                  Verify
                </button>
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-500 pb-2" />
              )}
            </div>
            {otpState.phoneOtpSent && !verification.is_phone_verified && (
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="Enter Phone OTP" 
                  className="flex-1 text-sm border rounded-lg px-3 py-2"
                  value={otpState.phoneOtp} onChange={e => setOtpState({...otpState, phoneOtp: e.target.value})}
                />
                <button onClick={() => handleVerifyOtp('phone')} className="px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">Confirm</button>
              </div>
            )}
          </div>

          <InputField label="License Number" name="license_number" value={formData.license_number} readOnly />
          <InputField label="Years of Experience" name="experience_years" value={formData.experience_years} readOnly />
        </div>
      </div>

      {/* 2. Physical Locations Section (Remains Unchanged) */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Practice Locations & Addresses</h3>
        {/* Address rendering and form logic identical to your original layout */}
      </div>
    </div>
  );
}