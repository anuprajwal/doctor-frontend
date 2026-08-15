import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';

// Lightweight inline SVG icons
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

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
        is_email_verified: Boolean(user.is_email_verified),
        is_phone_verified: Boolean(user.is_phone_verified)
      });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to load user profile data.', success: null });
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);

    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await doctorService.uploadPhoto(data);
      setFormData(prev => ({ ...prev, profile_picture: res.data?.url || '' }));
      setStatus({ loading: false, error: null, success: 'Profile photo updated successfully!' });
    } catch (err) {
      setStatus({ loading: false, error: 'Photo upload failed.', success: null });
    }
  };

  const handlePhotoDelete = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.deletePhoto();
      setFormData(prev => ({ ...prev, profile_picture: '' }));
      setStatus({ loading: false, error: null, success: 'Profile photo removed.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to delete photo.', success: null });
    }
  };

  // Profile Update Submission
  const handleProfileUpdate = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.updateProfile(formData);
      setStatus({ loading: false, error: null, success: 'Profile details updated successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to update profile.', success: null });
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
      setStatus({ loading: false, error: err.response?.data?.message || `Failed to send ${type} OTP.`, success: null });
    }
  };

  const handleVerifyOtp = async (type) => {
    try {
      const payload = type === 'email' 
        ? { email: formData.email, userOtp: otpState.emailOtp }
        : { phoneNumber: formData.phone_number, userOtp: otpState.phoneOtp };
      
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
      setStatus({ loading: false, error: err.response?.data?.message || `Invalid ${type} OTP.`, success: null });
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      if (editingAddressId) {
        await doctorService.updateAddress({ addressId: editingAddressId, ...addressForm });
        setStatus({ loading: false, error: null, success: 'Address synchronized successfully.' });
      } else {
        await doctorService.addAddress(addressForm);
        setStatus({ loading: false, error: null, success: 'New address location recorded.' });
      }
      setAddressForm({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' });
      setEditingAddressId(null);
      fetchAddressesData();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed saving address.', success: null });
    }
  };

  const handleAddressDelete = async (id) => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.deleteAddress(id);
      setStatus({ loading: false, error: null, success: 'Address removed successfully.' });
      fetchAddressesData();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed clearing address.', success: null });
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 space-y-8">
      {/* 1. Core Profile Details */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Edit Doctor Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage personal credentials and active practice attributes.</p>
          </div>
          <button 
            type="button"
            onClick={handleProfileUpdate}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
          >
            Save Changes
          </button>
        </div>

        <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />

        {/* Photo Manager */}
        <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="relative w-24 h-24 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
            {formData.profile_picture ? (
              <img src={formData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🩺</span>
            )}
          </div>
          <div className="flex gap-2">
            <label className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-blue-700 transition">
              Upload Photo
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {formData.profile_picture && (
              <button 
                type="button" 
                onClick={handlePhotoDelete} 
                className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 transition"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
          <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />

          {/* Email Verification Component */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <InputField label="Email Address (Read-only)" name="email" value={formData.email} readOnly />
              </div>
              {verification.is_email_verified ? (
                <div className="h-10 flex items-center px-2">
                  <CheckCircleIcon />
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleSendOtp('email')} 
                  className="h-10 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg border border-slate-200 transition"
                >
                  Verify
                </button>
              )}
            </div>
            {otpState.emailOtpSent && !verification.is_email_verified && (
              <div className="flex gap-2 animate-fadeIn">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Email OTP" 
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={otpState.emailOtp} 
                  onChange={e => setOtpState(prev => ({ ...prev, emailOtp: e.target.value }))}
                />
                <button 
                  type="button"
                  onClick={() => handleVerifyOtp('email')} 
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>

          {/* Mobile Verification Component */}
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <InputField label="Phone Number (Read-only)" name="phone_number" value={formData.phone_number} readOnly />
              </div>
              {verification.is_phone_verified ? (
                <div className="h-10 flex items-center px-2">
                  <CheckCircleIcon />
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => handleSendOtp('phone')} 
                  className="h-10 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg border border-slate-200 transition"
                >
                  Verify
                </button>
              )}
            </div>
            {otpState.phoneOtpSent && !verification.is_phone_verified && (
              <div className="flex gap-2 animate-fadeIn">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit Mobile OTP" 
                  className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                  value={otpState.phoneOtp} 
                  onChange={e => setOtpState(prev => ({ ...prev, phoneOtp: e.target.value }))}
                />
                <button 
                  type="button"
                  onClick={() => handleVerifyOtp('phone')} 
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>

          <InputField label="License Number" name="license_number" value={formData.license_number} readOnly />
          <InputField label="Years of Experience" name="experience_years" value={formData.experience_years} readOnly />
        </div>
      </div>

      {/* 2. Practice Locations & Addresses */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Practice Locations & Addresses</h3>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
          {!Array.isArray(addresses) || addresses.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4">No clinic addresses mapped onto this account.</p>
          ) : (
            addresses.map((addr, idx) => (
              <div key={addr.addressId || idx} className="p-4 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800 font-bold block">{addr.houseNo || 'Main Facility'} {addr.street}</strong>
                  <span>{addr.city}, {addr.state} - {addr.pincode} {addr.landmark && `[Ref: ${addr.landmark}]`}</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => { setEditingAddressId(addr.addressId); setAddressForm(addr); }} 
                    className="text-blue-600 hover:underline font-bold"
                  >
                    Edit
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleAddressDelete(addr.addressId)} 
                    className="text-rose-600 hover:text-rose-800 font-bold"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddressSubmit} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-700">{editingAddressId ? 'Edit Workspace Location' : 'Add New Practice Address'}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InputField label="House/Clinic No" value={addressForm.houseNo} onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })} placeholder="Rm 404" />
            <InputField label="Street Route" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="Main Rd" />
            <InputField label="City Landmark" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} />
            <InputField label="City Area" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" />
            <InputField label="State Region" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="State" />
            <InputField label="Postal Code" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="500001" />
            <InputField label="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} placeholder="India" />
          </div>
          <div className="flex justify-end gap-2">
            {editingAddressId && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' });
                }}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition">
              {editingAddressId ? 'Save Updates' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}