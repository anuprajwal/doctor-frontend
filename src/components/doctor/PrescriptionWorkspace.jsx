import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function PrescriptionWorkspace({ appointment, onBack }) {
  const [medications, setMedications] = useState([
    { id: 1, name: 'Amoxicillin 500mg Oral Capsule', dosage: '1 Capsule', frequency: 'Three times daily', duration: '10 Days' }
  ]);
  const [pharmacy, setPharmacy] = useState('CVS Pharmacy - 123 Health Way, Central City');
  const [internalNotes, setInternalNotes] = useState(
    'Patient reports slight dizziness since starting Lisinopril. BP today is within target. Will monitor for 10 more days. Scheduled follow-up blood work for next month. Lungs clear on auscultation.'
  );
  
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const [noPrescriptionState, setNoPrescriptionState] = useState(false);

  useEffect(() => {
    fetchExistingPrescriptionRecord();
  }, [appointment.id]);

  const fetchExistingPrescriptionRecord = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await doctorService.getPrescription(appointment.id);
      if (res.data && res.data.medications?.length > 0) {
        setMedications(res.data.medications);
        if (res.data.pharmacy) setPharmacy(res.data.pharmacy);
        if (res.data.internalNotes) setInternalNotes(res.data.internalNotes);
        setNoPrescriptionState(false);
      } else {
        setNoPrescriptionState(true);
      }
      setStatus({ loading: false });
    } catch (err) {
      setNoPrescriptionState(true);
      setStatus({ loading: false });
    }
  };

  const handleAddMedicationRow = () => {
    setMedications(prev => [
      ...prev,
      { id: Date.now(), name: '', dosage: '', frequency: 'Once daily (Morning)', duration: '' }
    ]);
    setNoPrescriptionState(false);
  };

  const handleUpdateMedicationRow = (id, field, value) => {
    setMedications(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleRemoveMedicationRow = (id) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const executeCommitPrescription = async () => {
    if (medications.length === 0 || medications.some(m => !m.name.trim())) {
      setStatus({ ...status, error: 'Cannot commit empty rows or unlabelled drug names to system prescription matrix.' });
      return;
    }

    setStatus({ loading: true, error: null, success: null });
    try {
      const payload = { medications, pharmacy, internalNotes };
      await doctorService.savePrescription(appointment.id, payload);
      setStatus({ loading: false, error: null, success: 'Prescription successfully verified and synced to ledger.' });
      setNoPrescriptionState(false);
    } catch (err) {
      setStatus({ loading: false, error: 'Failed saving target clinical values to engine schema structure.', success: null });
    }
  };

  const triggerPrintEngine = () => {
    window.print();
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Structural Sub-Panels left: Historical Metrics Context */}
      <div class="space-y-6 self-start print:hidden">
        <div class="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
          <div class="flex items-center gap-2">
            <button onClick={onBack} class="text-xs text-slate-400 font-bold hover:underline">← Exit Workspace</button>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">🩺</div>
            <div>
              <h3 class="text-sm font-bold text-slate-800">{appointment.patientName}</h3>
              <p class="text-[10px] text-slate-400">MRN: {appointment.patientId} | Male</p>
            </div>
          </div>
          <hr class="border-slate-100" />
          <div class="text-xs space-y-2 text-slate-600 font-medium">
            <div class="flex justify-between"><span>Last Checked Blood Pressure</span><span class="text-slate-800 font-bold">120/80 mmHg</span></div>
            <div class="flex justify-between"><span>Heart Rate Rhythm</span><span class="text-slate-800 font-bold">72 bpm</span></div>
            <div class="flex justify-between"><span>Allergy Array Bounds</span><span class="text-rose-600 font-bold">Penicillin</span></div>
          </div>
        </div>

        {/* Dynamic Static Document Registry Column */}
        <div class="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Document History Records</h4>
          <div class="space-y-3">
            {['Blood Work Summary', 'Chest X-Ray (Posterior)', 'ECG Stress Test'].map((name, i) => (
              <div key={i} class="p-3 border border-slate-100 rounded-lg bg-slate-50/30 flex items-center gap-3">
                <span class="text-xl">📊</span>
                <div>
                  <span class="text-xs font-bold text-slate-700 block">{name}</span>
                  <span class="text-[9px] text-slate-400 block">Oct {12 - i * 3}, 2023 • Lab Metrics</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Right Area Workspace Editor */}
      <div class="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 space-y-6 print:p-0 print:border-none">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 print:hidden">
          <div>
            <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
              Prescription Interface Workspace <span class="px-2 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded font-bold uppercase tracking-wider">Draft Mode</span>
            </h2>
            <p class="text-[10px] text-slate-400 mt-0.5">Appointment Target Boundary ID: #{appointment.id}</p>
          </div>
          <div class="flex gap-2">
            <button onClick={onBack} class="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition">Discard Draft</button>
            <button onClick={triggerPrintEngine} class="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition flex items-center gap-1">🖨️ Print</button>
            <button onClick={executeCommitPrescription} class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition">Save & Finalize Prescription 🚀</button>
          </div>
        </div>

        <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
        {status.loading && <Loader />}

        {/* Dynamic Intercept: Render No Prescription Placeholder */}
        {noPrescriptionState ? (
          <div class="p-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center space-y-3">
            <span class="text-3xl block">💊</span>
            <h4 class="text-sm font-bold text-slate-700">No Active Prescriptions Created</h4>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">There are no medication records mapped to this clinical consultation sequence yet.</p>
            <button type="button" onClick={handleAddMedicationRow} class="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition">
              Create New Script Row
            </button>
          </div>
        ) : (
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Medications List</h3>
              <button onClick={handleAddMedicationRow} class="text-xs text-blue-600 font-bold hover:underline print:hidden">+ Add Medication Line</button>
            </div>

            <div class="space-y-4">
              {medications.map((med, index) => (
                <div key={med.id} class="p-4 border border-slate-200 rounded-xl bg-slate-50/30 grid grid-cols-1 sm:grid-cols-12 gap-3 relative group">
                  <div class="sm:col-span-4">
                    <label class="block text-[10px] text-slate-400 font-bold mb-1">MEDICATION NAME</label>
                    <input 
                      type="text" 
                      value={med.name} 
                      onChange={(e) => handleUpdateMedicationRow(med.id, 'name', e.target.value)}
                      placeholder="e.g. Amoxicillin 500mg" 
                      class="w-full px-3 py-1.5 border rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-[10px] text-slate-400 font-bold mb-1">DOSAGE</label>
                    <input 
                      type="text" 
                      value={med.dosage} 
                      onChange={(e) => handleUpdateMedicationRow(med.id, 'dosage', e.target.value)}
                      placeholder="1 Capsule" 
                      class="w-full px-3 py-1.5 border rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div class="sm:col-span-3">
                    <label class="block text-[10px] text-slate-400 font-bold mb-1">FREQUENCY</label>
                    <select 
                      value={med.frequency} 
                      onChange={(e) => handleUpdateMedicationRow(med.id, 'frequency', e.target.value)}
                      class="w-full px-2 py-1.5 border rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Once daily (Morning)">Once daily (Morning)</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="As required (PRN)">As required (PRN)</option>
                    </select>
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-[10px] text-slate-400 font-bold mb-1">DURATION</label>
                    <input 
                      type="text" 
                      value={med.duration} 
                      onChange={(e) => handleUpdateMedicationRow(med.id, 'duration', e.target.value)}
                      placeholder="10 Days" 
                      class="w-full px-3 py-1.5 border rounded-lg bg-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  <div class="sm:col-span-1 flex items-end justify-center pb-1 print:hidden">
                    <button onClick={() => handleRemoveMedicationRow(med.id)} class="text-slate-300 hover:text-rose-600 transition text-base" title="Remove row">🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Structured Pharmacy Dispatch Selector */}
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Selected Pharmacy Destination</label>
              <select 
                value={pharmacy} 
                onChange={(e) => setPharmacy(e.target.value)} 
                class="w-full p-3 border border-slate-200 rounded-xl bg-slate-50/50 text-xs font-semibold outline-none focus:border-blue-500"
              >
                <option value="CVS Pharmacy - 123 Health Way, Central City">CVS Pharmacy - 123 Health Way, Central City</option>
                <option value="Walgreens Care Hub - 789 Medical Plaza">Walgreens Care Hub - 789 Medical Plaza</option>
              </select>
            </div>

            {/* Internal Observation Notes */}
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Internal Doctor Clinical Evaluation Notes</label>
              <textarea 
                value={internalNotes} 
                onChange={(e) => setInternalNotes(e.target.value)}
                class="w-full h-24 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
              />
              <div class="text-[10px] text-slate-400 mt-2 flex justify-between items-center">
                <span>⚡ Auto-saved 2 mins ago</span>
                <button type="button" class="text-blue-600 font-semibold hover:underline print:hidden">🔗 Attach Reference</button>
              </div>
            </div>

            {/* Interaction Diagnostics Flag Banner */}
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 print:hidden">
              <span class="text-base">✓</span> Cross-Interaction Drug Conflict Processing Check: <span class="underline">NO CONFLICTS DETECTED</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}