import React, { useState, useEffect } from 'react';
import { doctorEndpoints } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function PrescriptionWorkspace({ appointment, onBack }) {
  const [prescriptionList, setPrescriptionList] = useState([
    { drug: 'pcm', qty: '1', timing: 'morning, afternoon, evening', notes: 'take after meals' }
  ]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: null, message: '' });

  useEffect(() => {
    if (appointment?.id) {
      fetchExistingPrescription();
    }
  }, [appointment?.id]);

  const fetchExistingPrescription = async () => {
    setLoading(true);
    try {
      const res = await doctorEndpoints.getPrescription(appointment.id);
      const fetchedRx = res.data?.prescription || res.data?.medications || [];
      if (Array.isArray(fetchedRx) && fetchedRx.length > 0) {
        setPrescriptionList(fetchedRx);
      }
    } catch (err) {
      console.log('No existing prescription found or error fetching prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setPrescriptionList([...prescriptionList, { drug: '', qty: '', timing: '', notes: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (prescriptionList.length === 1) return;
    setPrescriptionList(prescriptionList.filter((_, idx) => idx !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...prescriptionList];
    updated[index][field] = value;
    setPrescriptionList(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStatusMsg({ type: null, message: '' });

    const payload = {
      appointment_id: appointment.id,
      appointment_status: 'closed',
      prescription: prescriptionList
    };

    try {
      await doctorEndpoints.updatePrescription(payload);
      setStatusMsg({ type: 'success', message: 'Prescription saved and appointment closed successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'error', message: 'Error saving prescription. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <button onClick={onBack} className="text-slate-600 hover:text-slate-900 text-sm font-medium">
          ← Back
        </button>
        <h2 className="text-xl font-bold text-slate-800">Prescription Workspace #{appointment?.id}</h2>
      </div>

      <Alert type={statusMsg.type} message={statusMsg.message} />
      {loading && <Loader />}

      <div className="space-y-4">
        {prescriptionList.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 items-center">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">DRUG NAME</label>
              <input
                type="text"
                placeholder="e.g. PCM"
                value={item.drug || ''}
                onChange={(e) => handleChange(index, 'drug', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">QUANTITY</label>
              <input
                type="text"
                placeholder="e.g. 1"
                value={item.qty || ''}
                onChange={(e) => handleChange(index, 'qty', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">TIMING</label>
              <input
                type="text"
                placeholder="morning, evening"
                value={item.timing || ''}
                onChange={(e) => handleChange(index, 'timing', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[10px] text-slate-400 font-bold mb-1">NOTES</label>
                <input
                  type="text"
                  placeholder="take after meals"
                  value={item.notes || ''}
                  onChange={(e) => handleChange(index, 'notes', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:border-blue-500"
                />
              </div>
              {prescriptionList.length > 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveRow(index)} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Remove Medication Line"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <button 
          type="button" 
          onClick={handleAddRow} 
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
        >
          + Add Drug Line
        </button>
        <button 
          type="button" 
          onClick={handleSubmit} 
          disabled={loading} 
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          {loading ? 'Saving...' : 'Save & Close Appointment'}
        </button>
      </div>
    </div>
  );
}