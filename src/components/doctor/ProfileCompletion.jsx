import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';
import DoctorKycSection from './DoctorKycSection';

export default function ProfileCompletion() {
  const [formData, setFormData] = useState({
    id: '',
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    profile_picture: '',
    specialization: '',
    license_number: '',
    experience_years: ''
  });

  const [bankData, setBankData] = useState({ 
    account_number: '', 
    beneficiary_name: '', 
    ifsc_code: '' 
  });
  
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({ 
    city: '', 
    pincode: '', 
    street: '', 
    state: '', 
    country: '', 
    landmark: '', 
    houseNo: '' 
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const fetchUserData = async () => {
    try {
      const res = await doctorService.getUserData();
      const user = res.data?.userData || {};
      const profile = user.doctorProfile || {};

      // Map incoming user & nested doctorProfile data
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

      // Populate banking form if available on doctorProfile
      setBankData({
        account_number: profile.account_number || '',
        beneficiary_name: profile.beneficiary_name || '',
        ifsc_code: profile.ifsc_code || ''
      });
    } catch (err) {
      setStatus({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to load user profile information.', 
        success: null 
      });
    }
  };

  const fetchAddressesData = async () => {
    try {
      const res = await doctorService.getAllAddresses();
      const dataList = Array.isArray(res.data) ? res.data : (res.data?.addresses || []);
      setAddresses(dataList);
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

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.uploadBankDetails(bankData);
      setStatus({ loading: false, error: null, success: 'Bank settlement details saved successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to save bank details.', success: null });
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      if (editingAddressId) {
        await doctorService.updateAddress({ addressId: editingAddressId, ...addressForm });
        setStatus({ loading: false, error: null, success: 'Address updated successfully.' });
      } else {
        await doctorService.addAddress(addressForm);
        setStatus({ loading: false, error: null, success: 'New address recorded successfully.' });
      }
      setAddressForm({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' });
      setEditingAddressId(null);
      fetchAddressesData();
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed to update address.', success: null });
    }
  };

  const handleAddressDelete = async (id) => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.deleteAddress(id);
      setStatus({ loading: false, error: null, success: 'Address deleted successfully.' });
      fetchAddressesData();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to delete address.', success: null });
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 space-y-8">
      {/* 1. Core Profile Details */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Edit Doctor Profile</h2>
          <p className="text-xs text-slate-400 mt-1">Manage core personal attributes and practice details.</p>
        </div>

        <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />

        <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="relative w-24 h-24 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
            {formData.profile_picture ? (
              <img src={formData.profile_picture} alt={formData.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🩺</span>
            )}
          </div>
          <div className="flex gap-2">
            <label className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-blue-700 transition">
              Upload Image
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {formData.profile_picture && (
              <button type="button" onClick={handlePhotoDelete} className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 transition">
                Remove Picture
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleInputChange} />
          <InputField label="Email Address (Read-only)" name="email" value={formData.email} readOnly />
          <InputField label="Phone Number (Read-only)" name="phone_number" value={formData.phone_number} readOnly />
          <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />
          <InputField label="License Number (Read-only)" name="license_number" value={formData.license_number} readOnly />
          <InputField label="Years of Experience (Read-only)" name="experience_years" value={formData.experience_years} readOnly />
        </div>
      </div>

      {/* 2. Razorpay Banking KYC Verification */}
      <DoctorKycSection doctorId={formData.doctorProfile.id || '4'} />

      {/* 3. Bank Details Section */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Institutional Bank Details Configuration</h3>
        <form onSubmit={handleBankSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <InputField 
            label="Beneficiary Name" 
            value={bankData.beneficiary_name} 
            onChange={(e) => setBankData({ ...bankData, beneficiary_name: e.target.value })} 
            placeholder="e.g. Dr Anupraja" 
          />
          <InputField 
            label="Account Number" 
            value={bankData.account_number} 
            onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })} 
            placeholder="222222222222" 
          />
          <InputField 
            label="IFSC Code" 
            value={bankData.ifsc_code} 
            onChange={(e) => setBankData({ ...bankData, ifsc_code: e.target.value })} 
            placeholder="HDFC0000001" 
          />
          <div className="sm:col-span-3 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition">
              Save Settlement Account
            </button>
          </div>
        </form>
      </div>

      {/* 4. Physical Locations Section */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Practice Locations & Addresses</h3>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
          {!Array.isArray(addresses) || addresses.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4">No clinic addresses mapped onto this service configuration matrix.</p>
          ) : (
            addresses.map((addr, idx) => (
              <div key={addr.addressId || idx} className="p-4 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <strong className="text-slate-800 font-bold block">{addr.houseNo || 'Main Facility'} {addr.street}</strong>
                  <span>{addr.city}, {addr.state} - {addr.pincode} {addr.landmark && `[Ref: ${addr.landmark}]`}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditingAddressId(addr.addressId); setAddressForm(addr); }} className="text-blue-600 hover:underline font-semibold">Edit</button>
                  <button type="button" onClick={() => handleAddressDelete(addr.addressId)} className="text-rose-600 hover:underline font-semibold">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddressSubmit} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-700">{editingAddressId ? 'Edit Workspace Location' : 'Provision New Operational Address'}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InputField label="House/Clinic No" value={addressForm.houseNo} onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })} placeholder="Rm 404" />
            <InputField label="Street Route" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="rangashaipet" />
            <InputField label="City Landmark" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} />
            <InputField label="City Area" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="Warangal" />
            <InputField label="State Region" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="Telangana" />
            <InputField label="Postal Code" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="404066" />
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
              {editingAddressId ? 'Sync Updates' : 'Inject Address Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}