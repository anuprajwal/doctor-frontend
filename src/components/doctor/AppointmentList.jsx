import React, { useState, useEffect } from 'react';
import { doctorEndpoints } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function AppointmentList({ onViewDetails, onViewPrescription }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null });

  const [metrics, setMetrics] = useState({ today: 0, upcoming: 0, pending: 0, cancelled: 0 });

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterData();
  }, [appointments, activeTab, searchQuery]);

  const fetchAppointments = async () => {
    setStatus({ loading: true, error: null });
    try {
      const res = await doctorEndpoints.listAppointments();
      const data = res.data?.appointments || (Array.isArray(res.data) ? res.data : []);
      setAppointments(data);
      
      setMetrics({
        today: data.filter(a => a.timeCategory === 'today' || a.appointment_date?.includes(new Date().toISOString().split('T')[0])).length,
        upcoming: data.filter(a => (a.appointment_status || a.status)?.toLowerCase() === 'confirmed').length,
        pending: data.filter(a => (a.appointment_status || a.status)?.toLowerCase() === 'pending').length,
        cancelled: data.filter(a => (a.appointment_status || a.status)?.toLowerCase() === 'cancelled').length
      });
      setStatus({ loading: false, error: null });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to load appointments from server.' });
    }
  };

  const filterData = () => {
    let result = [...appointments];

    if (activeTab !== 'All') {
      result = result.filter(a => (a.appointment_type || a.type)?.toLowerCase() === activeTab.toLowerCase());
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => {
        const patientName = a.user?.username || a.patientName || '';
        const phone = a.user?.phone_number || '';
        const idStr = String(a.id || '');
        return patientName.toLowerCase().includes(query) || phone.includes(query) || idStr.includes(query);
      });
    }
    setFilteredAppointments(result);
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Today <span className="text-blue-500 text-base">📅</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.today}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">Scheduled for today</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Confirmed <span className="text-blue-500 text-base">📤</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.upcoming}</div>
          <div className="text-xs text-slate-400 mt-1">Confirmed slots</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Pending <span className="text-amber-500 text-base">📋</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.pending}</div>
          <div className="text-xs text-amber-600 font-semibold mt-1">Awaiting approval</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Cancelled <span className="text-red-500 text-base">❌</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.cancelled}</div>
          <div className="text-xs text-red-500 font-semibold mt-1">Cancelled / Voided</div>
        </div>
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg self-start">
            {['All', 'Online', 'In-clinic', 'Hybrid'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'}`}
              >
                {tab === 'All' ? 'All Appointments' : tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Search patient name, phone, ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <Alert type="error" message={status.error} />
        {status.loading ? <Loader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Appt ID</th>
                  <th className="p-4">Patient Details</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No appointments found matching your search.</td>
                  </tr>
                ) : filteredAppointments.map((item, index) => {
                  const uniqueKey = item.id || `appt-${index}`;
                  const patientName = item.user?.username || item.patientName || 'Patient';
                  const patientPhone = item.user?.phone_number || 'N/A';
                  const apptStatus = item.appointment_status || item.status || 'Pending';
                  const apptType = item.appointment_type || item.type || 'Online';
                  
                  return (
                    <tr key={uniqueKey} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900">#{item.id}</td>
                      <td className="p-4 font-semibold text-slate-800">
                        <div>{patientName}</div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">Phone: {patientPhone}</div>
                      </td>
                      <td className="p-4">
                        <div>{item.appointment_date ? new Date(item.appointment_date).toLocaleDateString() : (item.date || 'N/A')}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.appointment_start_time || item.time || ''}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600">
                          {apptType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide capitalize ${
                          apptStatus.toLowerCase() === 'closed' || apptStatus.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                          apptStatus.toLowerCase() === 'confirmed' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {apptStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3 text-slate-500">
                          <button 
                            onClick={() => onViewDetails(item)} 
                            className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition" 
                            title="View Details & Documents"
                          >
                            👁️ <span className="sr-only">Details</span>
                          </button>
                          <button 
                            onClick={() => onViewPrescription(item)} 
                            className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition" 
                            title="Prescription Workspace"
                          >
                            📝 <span className="sr-only">Prescription</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}