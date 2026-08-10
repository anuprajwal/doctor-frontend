// src/components/doctor/AppointmentList.jsx

import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
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
      const res = await doctorService.listAppointments();
      const data = Array.isArray(res.data) ? res.data : (res.data?.appointments || []);
      setAppointments(data);
      
      setMetrics({
        today: data.filter(a => a.timeCategory === 'today').length,
        upcoming: data.filter(a => a.status === 'CONFIRMED' || a.appointment_status === 'confirmed').length,
        pending: data.filter(a => a.status === 'PENDING' || a.appointment_status === 'pending').length,
        cancelled: data.filter(a => a.status === 'CANCELLED' || a.appointment_status === 'cancelled').length
      });
      setStatus({ loading: false, error: null });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to fetch appointment streams from server environment.' });
    }
  };

  const filterData = () => {
    let result = [...appointments];

    if (activeTab !== 'All') {
      result = result.filter(a => (a.type || a.appointment_type)?.toLowerCase().includes(activeTab.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.patientName?.toLowerCase().includes(query) || 
        a.patientId?.toString().toLowerCase().includes(query) ||
        a.reason?.toLowerCase().includes(query)
      );
    }
    setFilteredAppointments(result);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Today <span className="text-blue-500 text-base">📅</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.today}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Upcoming <span className="text-blue-500 text-base">📤</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.upcoming}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Pending <span className="text-amber-500 text-base">📋</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.pending}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Cancelled <span className="text-red-500 text-base">❌</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.cancelled}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg self-start">
            {['All', 'Online', 'In-clinic', 'Emergency'].map(tab => (
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
            <input 
              type="text" 
              placeholder="Search patient name, ID or reason..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <Alert type="error" message={status.error} />
        {status.loading ? <Loader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No matching appointment records found inside database view.</td>
                  </tr>
                ) : filteredAppointments.map((item, index) => (
                  <tr key={item.id || `appt-${index}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      <div>{item.patientName || item.patient_name || 'Patient'}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">ID: {item.patientId || item.patient_id || item.id}</div>
                    </td>
                    <td className="p-4">
                      <div>{item.date || item.appointment_date}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.time || item.appointment_start_time}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600">
                        {item.type || item.appointment_type || 'General'}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-500">{item.reason || 'Routine clinical assessment checkup.'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-50 text-emerald-600">
                        {item.status || item.appointment_status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-4 text-slate-400">
                        <button onClick={() => onViewDetails(item)} className="hover:text-blue-600 transition" title="View Appointment Details">
                          👁️
                        </button>
                        <button onClick={() => onViewPrescription(item)} className="hover:text-emerald-600 transition" title="Prescription Workspace">
                          📝
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}