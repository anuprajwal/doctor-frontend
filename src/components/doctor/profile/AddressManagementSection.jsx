import React from 'react';
import InputField from '../../ui/InputField';

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function AddressManagementSection({
  addresses,
  addressForm,
  setAddressForm,
  editingAddressId,
  setEditingAddressId,
  onSubmit,
  onDelete
}) {
  return (
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
                  onClick={() => onDelete(addr.addressId)} 
                  className="text-rose-600 hover:text-rose-800 font-bold"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={onSubmit} className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-4">
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
  );
}