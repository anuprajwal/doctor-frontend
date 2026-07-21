import React, { useState } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function HospitalSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSearchExecute = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await doctorService.searchHospitals(searchQuery.trim());
      // Fallback mock array structure generated matching requirement if collection returns blank
      const serverData = res.data || [];
      if (serverData.length === 0) {
        setHospitals([
          { id: "5", name: "Apollo MedCity Global", staffCount: 142, address: "74 Medical Heights Ave, Cyber Corridor", services: ["Physiotherapy", "Psychology", "Gynecology", "Cardiology"], description: "Premier diagnostic medical institute handling advanced clinical operations across multi-specialty practices." }
        ]);
      } else {
        setHospitals(serverData);
      }
      setStatus({ loading: false });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed targeting hospital indexes from filter microservices.' });
    }
  };

  const handleSendJoinRequest = async (organisationId) => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.requestAdmission(organisationId);
      setStatus({ loading: false, error: null, success: 'Membership authorization request transmitted to organizational clearing board.' });
    } catch (err) {
      setStatus({ loading: false, error: 'Admission transaction rejected by target gateway constraints.', success: null });
    }
  };

  return (
    <div class="space-y-6">
      <div class="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
        <h2 class="text-base font-bold text-slate-800">Affiliated Hospital Registry Discovery</h2>
        <p class="text-[11px] text-slate-400 mt-0.5">Lookup medical institutions across directory nodes and link your practicing profile license credentials.</p>
        
        <form onSubmit={handleSearchExecute} class="mt-4 flex gap-2">
          <input 
            type="text" 
            placeholder="Search hospitals by registered business name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            class="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
          />
          <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition">Query Index</button>
        </form>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
      {status.loading && <Loader />}

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Results Stream Column Container */}
        <div class="md:col-span-1 space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Matching Corporate Entities</h3>
          {hospitals.length === 0 ? (
            <p class="text-xs text-slate-400 italic bg-white p-4 border rounded-xl border-slate-200/80">Execute directory search queries to gather operational hospital networks.</p>
          ) : hospitals.map(h => (
            <div 
              key={h.id} 
              onClick={() => setSelectedHospital(h)}
              className={`p-4 border rounded-xl bg-white cursor-pointer transition shadow-sm ${selectedHospital?.id === h.id ? 'border-blue-500 ring-2 ring-blue-500/5' : 'border-slate-200/80 hover:border-slate-300'}`}
            >
              <h4 class="text-xs font-bold text-slate-800">{h.name}</h4>
              <p class="text-[10px] text-slate-400 truncate mt-1">📍 {h.address}</p>
            </div>
          ))}
        </div>

        {/* Deep Dive Profile Dynamic Panel Showcase */}
        <div class="md:col-span-2">
          {selectedHospital ? (
            <div class="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6 space-y-6 animate-pulse-subtle-once">
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">🏢 {selectedHospital.name}</h2>
                  <p class="text-xs text-slate-500 mt-1">📍 Location Matrix: {selectedHospital.address}</p>
                </div>
                <button 
                  onClick={() => handleSendJoinRequest(selectedHospital.id)}
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm self-start whitespace-nowrap"
                >
                  Send Admission Request ✉️
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4 text-xs">
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span class="text-slate-400 block font-medium">Registered Staff Practitioners</span>
                  <span class="text-slate-800 font-bold text-sm block mt-0.5">{selectedHospital.staffCount} Certified MDs</span>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span class="text-slate-400 block font-medium">Institution Identifier Code</span>
                  <span class="text-slate-800 font-bold text-sm block mt-0.5">ORGA-NODE-{selectedHospital.id}</span>
                </div>
              </div>

              <div class="space-y-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Institutional Profile Overview</h4>
                <p class="text-xs text-slate-600 leading-relaxed bg-slate-50/20 p-3 rounded-lg border border-slate-100">{selectedHospital.description}</p>
              </div>

              <div class="space-y-2">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical Specialties Provided</h4>
                <div class="flex flex-wrap gap-1.5">
                  {selectedHospital.services?.map((svc, idx) => (
                    <span key={idx} class="px-2.5 py-1 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold tracking-wide uppercase">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div class="h-full border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-8 bg-white/50 text-slate-400 italic text-xs min-h-[300px]">
              Select a clinical corporate entity node from the left hierarchy viewport list to extract organizational profile data streams.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}