import React, { useState, useEffect, useMemo } from 'react';
import { doctorService } from '../../services/api';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';

import ProfilePhotoSection from './profile/ProfilePhotoSection';
import OtpVerificationField from './profile/OtpVerificationField';
import AddressManagementSection from './profile/AddressManagementSection';

const MAX_ATTEMPTS = 3;

export default function ProfileCompletion() {
  const [formData, setFormData] = useState({
    id: '', full_name: '', email: '', phone_number: '',
    date_of_birth: '', gender: '', profile_picture: '',
    specialization: '', license_number: '', practice_start_date: ''
  });
  
  const [verification, setVerification] = useState({
    is_email_verified: false,
    is_phone_verified: false
  });

  const [otpState, setOtpState] = useState({
    email: { otp: '', sent: false, loading: false, error: null, resendTimer: 0, attempts: 0 },
    phone: { otp: '', sent: false, loading: false, error: null, resendTimer: 0, attempts: 0 }
  });

  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  // Calculate experience in years and months from practice_start_date
  const experienceText = useMemo(() => {
    if (!formData.practice_start_date) return 'Not specified';

    const [startYear, startMonth] = formData.practice_start_date.split('-').map(Number);
    if (!startYear || !startMonth) return 'Not specified';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    let totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    if (totalMonths < 0) return 'Practice starts in the future';

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const yearStr = years > 0 ? `${years} ${years === 1 ? 'year' : 'years'}` : '';
    const monthStr = months > 0 ? `${months} ${months === 1 ? 'month' : 'months'}` : '';

    if (yearStr && monthStr) return `${yearStr}, ${monthStr} of experience`;
    if (yearStr) return `${yearStr} of experience`;
    if (monthStr) return `${monthStr} of experience`;
    return 'Less than a month of experience';
  }, [formData.practice_start_date]);

  const fetchUserData = async () => {
    try {
      const res = await doctorService.getUserData();
      const user = res.data?.userData || {};
      const profile = user.doctorProfile || {};

      // Extracts 'YYYY-MM' format if practice_start_date is an ISO string or full date
      const practiceStart = profile.practice_start_date
        ? profile.practice_start_date.slice(0, 7)
        : '';

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
        practice_start_date: practiceStart
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

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpState(prev => {
        let updated = { ...prev };
        let changed = false;

        ['email', 'phone'].forEach(type => {
          if (updated[type].resendTimer > 0) {
            updated[type] = { ...updated[type], resendTimer: updated[type].resendTimer - 1 };
            changed = true;
          }
        });

        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (type, value) => {
    setOtpState(prev => ({
      ...prev,
      [type]: { ...prev[type], otp: value, error: null }
    }));
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
    } finally {
      window.location.reload();
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

  const handleProfileUpdate = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const payload = {
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        profile_picture: formData.profile_picture || '',
        specialization: formData.specialization,
        license_number: formData.license_number,
        practice_start_date: formData.practice_start_date
      };

      await doctorService.updateProfile(payload);
      setStatus({ loading: false, error: null, success: 'Profile details updated successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to update profile.', success: null });
    }
  };

  const handleSendOtp = async (type) => {
    if (otpState[type].resendTimer > 0) return;

    setOtpState(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null }
    }));

    try {
      if (type === 'email') {
        await doctorService.sendEmailOtp(formData.email);
      } else {
        await doctorService.sendMobileOtp(formData.phone_number);
      }

      setOtpState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          sent: true,
          loading: false,
          resendTimer: 30,
          error: null,
          otp: ''
        }
      }));
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Failed to send OTP to ${type}.`;
      setOtpState(prev => ({
        ...prev,
        [type]: { ...prev[type], loading: false, error: errorMsg }
      }));
    }
  };

  const handleVerifyOtp = async (type) => {
    const currentOtp = otpState[type].otp.trim();

    if (!currentOtp || currentOtp.length < 4) {
      setOtpState(prev => ({
        ...prev,
        [type]: { ...prev[type], error: 'Please enter a valid OTP code.' }
      }));
      return;
    }

    setOtpState(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, error: null }
    }));

    try {
      const payload = type === 'email'
        ? { email: formData.email, userOtp: currentOtp }
        : { phoneNumber: formData.phone_number, userOtp: currentOtp };

      await doctorService.verifyOtp(payload);

      setVerification(prev => ({
        ...prev,
        [type === 'email' ? 'is_email_verified' : 'is_phone_verified']: true
      }));

      setOtpState(prev => ({
        ...prev,
        [type]: { ...prev[type], sent: false, loading: false, error: null, attempts: 0 }
      }));
    } catch (err) {
      const nextAttempts = otpState[type].attempts + 1;
      let errorMsg = err.response?.data?.message || 'Invalid verification code.';

      if (nextAttempts >= MAX_ATTEMPTS) {
        errorMsg = 'Maximum attempts reached. Please request a new OTP.';
      }

      setOtpState(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          loading: false,
          error: errorMsg,
          attempts: nextAttempts
        }
      }));
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

        <ProfilePhotoSection
          profilePicture={formData.profile_picture}
          onPhotoUpload={handlePhotoUpload}
          onPhotoDelete={handlePhotoDelete}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
          <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />

          <OtpVerificationField
            type="email"
            label="Email Address (Read-only)"
            name="email"
            value={formData.email}
            isVerified={verification.is_email_verified}
            otpData={otpState.email}
            maxAttempts={MAX_ATTEMPTS}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            onOtpChange={handleOtpChange}
            placeholder="Enter Email OTP"
            helperText="Enter code sent to your inbox"
          />

          <OtpVerificationField
            type="phone"
            label="Phone Number (Read-only)"
            name="phone_number"
            value={formData.phone_number}
            isVerified={verification.is_phone_verified}
            otpData={otpState.phone}
            maxAttempts={MAX_ATTEMPTS}
            onSendOtp={handleSendOtp}
            onVerifyOtp={handleVerifyOtp}
            onOtpChange={handleOtpChange}
            placeholder="Enter 6-digit Mobile OTP"
            helperText="Enter SMS code sent to your mobile"
          />

          <InputField label="License Number" name="license_number" onChange={handleInputChange} value={formData.license_number} />
          
          {/* Practice Start Date & Computed Experience */}
          <div className="space-y-1">
            <InputField 
              label="Practice Start Date (Month & Year)" 
              type="month" 
              name="practice_start_date" 
              value={formData.practice_start_date} 
              onChange={handleInputChange} 
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Calculated Experience: <span className="text-blue-600 font-semibold">{experienceText}</span>
            </p>
          </div>

          <InputField 
            label="Date of Birth" 
            type="date" 
            name="date_of_birth" 
            value={formData.date_of_birth} 
            onChange={handleInputChange} 
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Practice Locations & Addresses */}
      <AddressManagementSection
        addresses={addresses}
        addressForm={addressForm}
        setAddressForm={setAddressForm}
        editingAddressId={editingAddressId}
        setEditingAddressId={setEditingAddressId}
        onSubmit={handleAddressSubmit}
        onDelete={handleAddressDelete}
      />
    </div>
  );
}