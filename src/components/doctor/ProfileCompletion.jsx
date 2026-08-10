import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import InputField from '../ui/InputField';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function ProfileCompletion() {
  const [formData, setFormData] = useState({
    full_name: 'Dr. Jonathan Smith',
    email: 'dr.smith@medicalcloud.com',
    phone_number: '9876543210',
    date_of_birth: '2006-07-25',
    gender: 'Male',
    profile_picture: '',
    specialization: 'Cardiologist',
    license_number: 'dc75dc462',
    experience_years: '2'
  });

  const [bankData, setBankData] = useState({ account_number: '', beneficiary_name: '', ifsc_code: '' });
  
  // Explicitly initialize as an array to prevent .map crashes
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' });
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [otpMode, setOtpMode] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    fetchAddressesData();
  }, []);

  const fetchAddressesData = async () => {
    try {
      const res = await doctorService.getAllAddresses();
      // Guard against non-array responses (null, undefined, or object wrappers)
      const addressData = Array.isArray(res.data) ? res.data : (res.data?.addresses || []);
      setAddresses(addressData);
    } catch (err) {
      console.error("Failed fetching address list.", err);
      setAddresses([]);
    }
  };

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
      setStatus({ loading: false, error: 'Photo deletion failed.', success: null });
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.uploadBankDetails(bankData);
      setStatus({ loading: false, error: null, success: 'Bank details saved successfully.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Bank details submission failed.', success: null });
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
        setStatus({ loading: false, error: null, success: 'New address added successfully.' });
      }
      setAddressForm({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' });
      setEditingAddressId(null);
      fetchAddressesData();
    } catch (err) {
      setStatus({ loading: false, error: 'Address submission failed.', success: null });
    }
  };

  const handleAddressDelete = async (id) => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.deleteAddress(id);
      setStatus({ loading: false, error: null, success: 'Address removed successfully.' });
      fetchAddressesData();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to delete address.', success: null });
    }
  };

  // Safe fallback to prevent map runtime crash
  const safeAddresses = Array.isArray(addresses) ? addresses : [];

  return (
    <div className="max-w-4xl mx-auto my-10 space-y-8">
      {/* Main Doctor Profile Information */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">Edit Doctor Profile</h2>
          <p className="text-xs text-slate-400 mt-1">Manage core profile attributes and consultation metrics.</p>
        </div>

        <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />

        <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="relative w-24 h-24 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
            {formData.profile_picture ? (
              <img src={formData.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
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
          <InputField label="Phone Number" name="phone_number" value={formData.phone_number} readOnly />
          <InputField label="Specialization" name="specialization" value={formData.specialization} onChange={handleInputChange} />
          <InputField label="License Number" name="license_number" value={formData.license_number} readOnly />
          <InputField label="Years of Experience" name="experience_years" value={formData.experience_years} readOnly />
        </div>
      </div>

      {/* Institutional Bank Setup */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Bank Details Configuration</h3>
        <form onSubmit={handleBankSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <InputField label="Beneficiary Bank Name" value={bankData.beneficiary_name} onChange={(e) => setBankData({ ...bankData, beneficiary_name: e.target.value })} placeholder="e.g. RAJU BANK" />
          <InputField label="Account Number" value={bankData.account_number} onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })} placeholder="7894561230" />
          <InputField label="IFSC Code" value={bankData.ifsc_code} onChange={(e) => setBankData({ ...bankData, ifsc_code: e.target.value })} placeholder="SBIN0000456" />
          <div className="sm:col-span-3 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition">Save Bank Details</button>
          </div>
        </form>
      </div>

      {/* Practice Locations and Addresses */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Practice Locations & Addresses</h3>
        
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
          {safeAddresses.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4">No clinic or hospital addresses mapped yet.</p>
          ) : (
            safeAddresses.map((addr, idx) => {
              const addressId = addr.addressId || addr.id || idx;
              return (
                <div key={addressId} className="p-4 flex items-center justify-between text-xs text-slate-600">
                  <div>
                    <strong className="text-slate-800 font-bold block">{addr.houseNo || 'Main Facility'} {addr.street}</strong>
                    <span>{addr.city}, {addr.state} - {addr.pincode} {addr.landmark && `[Ref: ${addr.landmark}]`}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setEditingAddressId(addressId); setAddressForm(addr); }} className="text-blue-600 hover:underline font-semibold">Edit</button>
                    <button type="button" onClick={() => handleAddressDelete(addressId)} className="text-rose-600 hover:underline font-semibold">Delete</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleAddressSubmit} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-700">{editingAddressId ? 'Edit Practice Location' : 'Add New Operational Address'}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <InputField label="House/Clinic No" value={addressForm.houseNo} onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })} placeholder="Rm 404" />
            <InputField label="Street Route" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} placeholder="rangashaipet" />
            <InputField label="Landmark" value={addressForm.landmark} onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })} />
            <InputField label="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="Warangal" />
            <InputField label="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} placeholder="Telangana" />
            <InputField label="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} placeholder="404066" />
            <InputField label="Country" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} placeholder="India" />
          </div>
          <div className="flex justify-end gap-2">
            {editingAddressId && (
              <button type="button" onClick={() => { setEditingAddressId(null); setAddressForm({ city: '', pincode: '', street: '', state: '', country: '', landmark: '', houseNo: '' }); }} className="px-3 py-1.5 border rounded-lg text-xs font-semibold">Cancel</button>
            )}
            <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition">{editingAddressId ? 'Save Changes' : 'Add Address'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}