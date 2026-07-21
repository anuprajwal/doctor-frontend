import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function ProfileCompletion() {
  const [formData, setFormData] = useState({
    full_name: 'Dr. Jonathan Smith', // Pre-filled mock values as seen in view
    email: 'dr.smith@medicalcloud.com',
    phone_number: '9876543210',
    date_of_birth: '2006-07-25',
    gender: 'Male',
    profile_picture: '',
    specialization: 'Cardiologist',
    license_number: '',
    experience_years: ''
  });

  const [initialLocks, setInitialLocks] = useState({ license_number: false, experience_years: false });
  const [otpMode, setOtpMode] = useState(null); // 'email' | 'phone' | null
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    // Dynamically retrieve verified flags to trigger field locks
    // Simulating initialization fetching logic
    if (formData.license_number) setInitialLocks(prev => ({ ...prev, license_number: true }));
    if (formData.experience_years) setInitialLocks(prev => ({ ...prev, experience_years: true }));
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
      setFormData(prev => ({ ...prev, profile_picture: res.data.url || '' }));
      setStatus({ loading: false, error: null, success: 'Profile picture updated successfully!' });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Photo upload execution failed.', success: null });
    }
  };

  const triggerOtpRequest = async (type) => {
    setStatus({ loading: true, error: null, success: null });
    try {
      if (type === 'email') await doctorService.sendEmailOtp(formData.email);
      else await doctorService.sendMobileOtp(formData.phone_number);
      setOtpMode(type);
      setStatus({ loading: false, error: null, success: `Verification OTP injected to target ${type}.` });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed targeting OTP deployment.', success: null });
    }
  };

  const verifyOtpCommit = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.verifyOtp({ userOtp: otpCode, phoneNumber: formData.phone_number });
      setStatus({ loading: false, error: null, success: 'Identity verified successfully!' });
      setOtpMode(null);
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'OTP payload validation mismatch.', success: null });
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      const payload = {
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        profile_picture: formData.profile_picture,
        specialization: formData.specialization,
        license_number: formData.license_number,
        experience_years: parseInt(formData.experience_years, 10)
      };
      await doctorService.updateProfile(payload);
      setStatus({ loading: false, error: null, success: 'Profile database synchronization complete!' });
      setInitialLocks({
        license_number: !!formData.license_number,
        experience_years: !!formData.experience_years
      });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed syncing profile parameters.', success: null });
    }
  };

  return (
    <div class="max-w-4xl mx-auto my-10 bg-white border border-slate-100 shadow-sm rounded-xl overflow-hidden">
      <div class="px-8 py-6 border-b border-slate-100">
        <h2 class="text-2xl font-bold text-slate-800">Edit Doctor Profile</h2>
        <p class="text-xs text-slate-500 mt-1">Update your professional information and consultation preferences.</p>
      </div>

      <form onSubmit={handleProfileSave} class="p-8 space-y-8">
        <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} onClose={() => setStatus({ ...status, error: null, success: null })} />

        {/* Profile Pic Sector */}
        <div class="flex flex-col items-center justify-center space-y-3">
          <div class="relative w-28 h-28 rounded-full border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
            {formData.profile_picture ? (
              <img src={formData.profile_picture} alt="Avatar" class="w-full h-full object-cover" />
            ) : (
              <div class="text-3xl text-slate-300">🩺</div>
            )}
            <label class="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition shadow">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} class="hidden" />
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </label>
          </div>
          <div class="text-center">
            <h3 class="text-base font-semibold text-slate-800">{formData.full_name || 'Dr. Smith'}</h3>
            <p class="text-xs text-slate-400 font-medium">{formData.specialization || 'General Physician'}</p>
          </div>
        </div>

        {/* Form Grid */}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
          <div class="relative">
            <InputField label="Email Address (Read-only)" name="email" value={formData.email} readOnly />
            <button type="button" onClick={() => triggerOtpRequest('email')} class="absolute top-8 right-3 text-xs text-blue-600 font-medium hover:underline">Verify</button>
          </div>
          <div class="relative">
            <InputField label="Phone Number" name="phone_number" value={formData.phone_number} readOnly />
            <button type="button" onClick={() => triggerOtpRequest('phone')} class="absolute top-8 right-3 text-xs text-blue-600 font-medium hover:underline">Verify</button>
          </div>
          <InputField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleInputChange} />
          <InputField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} />
          <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />
          <InputField label="License Number" name="license_number" value={formData.license_number} onChange={handleInputChange} readOnly={initialLocks.license_number} />
          <InputField label="Years of Experience" name="experience_years" type="number" value={formData.experience_years} onChange={handleInputChange} readOnly={initialLocks.experience_years} />
        </div>

        {/* Verification Modal / Overlay Segment */}
        {otpMode && (
          <div class="p-4 border border-blue-100 bg-blue-50/50 rounded-xl flex flex-col md:flex-row items-end gap-4">
            <div class="flex-1">
              <InputField label={`Enter OTP sent to target ${otpMode}`} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="------" />
            </div>
            <button type="button" onClick={verifyOtpCommit} class="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Confirm OTP</button>
          </div>
        )}

        {status.loading && <Loader />}

        <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" class="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition">Discard Changes</button>
          <button type="submit" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition">Save Profile</button>
        </div>
      </form>
    </div>
  );
}