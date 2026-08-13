import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function PrescriptionWorkspace({ appointmentId, onPrescriptionUpdated }) {
  const [medications, setMedications] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    if (appointmentId) {
      fetchExistingPrescriptionRecord();
    }
  }, [appointmentId]);

  const fetchExistingPrescriptionRecord = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await doctorService.getPrescription(appointmentId);
      const data = res.data;
      const fetchedMeds = Array.isArray(data) ? data : (data?.prescription || data?.medications || []);
      
      if (fetchedMeds.length > 0) {
        setMedications(fetchedMeds.map((m, idx) => ({
          id: m.id || Date.now() + idx,
          drug: m.drug || m.name || '',
          qty: m.qty || m.dosage || '',
          timing: m.timing || m.frequency || '',
          notes: m.notes || ''
        })));
      } else {
        setMedications([]);
      }
      setStatus({ loading: false, error: null, success: null });
    } catch (err) {
      setMedications([]);
      setStatus({ loading: false, error: null, success: null });
    }
  };

  const handleAddMedicationRow = () => {
    // Adds a completely empty row for the doctor to type into
    setMedications(prev => [
      ...prev,
      { id: Date.now(), drug: '', qty: '', timing: '', notes: '' }
    ]);
  };

  const handleUpdateMedicationRow = (id, field, value) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleRemoveMedicationRow = (id) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const executeCommitPrescription = async () => {
    if (medications.length === 0) {
      setStatus({ loading: false, error: 'Please add at least one prescription item.', success: null });
      return;
    }

    if (medications.some(m => !m.drug.trim())) {
      setStatus({ loading: false, error: 'Drug names cannot be empty.', success: null });
      return;
    }

    setStatus({ loading: true, error: null, success: null });
    try {
      const formattedPrescription = medications.map(m => ({
        drug: m.drug,
        qty: m.qty.toString(),
        timing: m.timing,
        notes: m.notes
      }));

      const payload = {
        appointment_id: appointmentId,
        appointment_status: "closed",
        prescription: formattedPrescription
      };

      await doctorService.updateAppointment(payload);
      setStatus({ loading: false, error: null, success: 'Prescription saved and appointment updated successfully!' });
      if (onPrescriptionUpdated) onPrescriptionUpdated();
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to submit prescription payload.', success: null });
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">💊 Clinical Prescription & Medication Input</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Manage medication lines and finalize consultation</p>
        </div>
        <button 
          onClick={handleAddMedicationRow} 
          type="button"
          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition"
        >
          + Create Prescription Line
        </button>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
      {status.loading && <Loader />}

      {medications.length === 0 ? (
        <div className="p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center space-y-2">
          <p className="text-xs text-slate-400">No active prescriptions added yet. Click above to add a new medication line.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <div key={med.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-3">
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Drug</label>
                <input 
                  type="text" 
                  value={med.drug} 
                  onChange={(e) => handleUpdateMedicationRow(med.id, 'drug', e.target.value)}
                  placeholder="e.g. PCM" 
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Qty</label>
                <input 
                  type="text" 
                  value={med.qty} 
                  onChange={(e) => handleUpdateMedicationRow(med.id, 'qty', e.target.value)}
                  placeholder="e.g. 1" 
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Timing</label>
                <input 
                  type="text" 
                  value={med.timing} 
                  onChange={(e) => handleUpdateMedicationRow(med.id, 'timing', e.target.value)}
                  placeholder="e.g. morning, evening" 
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] text-slate-400 font-bold mb-1 uppercase">Notes</label>
                <input 
                  type="text" 
                  value={med.notes} 
                  onChange={(e) => handleUpdateMedicationRow(med.id, 'notes', e.target.value)}
                  placeholder="e.g. take after meals" 
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="sm:col-span-1 flex items-end justify-center pt-3 sm:pt-0">
                <button 
                  onClick={() => handleRemoveMedicationRow(med.id)} 
                  type="button"
                  className="text-slate-400 hover:text-rose-600 transition text-base" 
                  title="Remove Line"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <button 
              onClick={executeCommitPrescription} 
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              Save & Finalize Prescription 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}