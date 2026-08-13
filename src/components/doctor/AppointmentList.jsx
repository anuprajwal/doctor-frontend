import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

export default function AppointmentList({ onViewDetails, onViewPrescription }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null });

  const [metrics, setMetrics] = useState({ total: 0, today: 0, confirmed: 0, completed: 0 });

  useEffect(() => {
    fetchAppointments();
    fetchNextAppointment();
  }, []);

  useEffect(() => {
    filterData();
  }, [appointments, activeTab, searchQuery]);

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : '';
  };

  const fetchNextAppointment = async () => {
    try {
      const res = await fetch('https://landing.docapp.co.in/api/appointment/next', {
        headers: { Authorization: `Bearer ${getCookie('auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNextAppointment(data?.appointment || data);
      }
    } catch (err) {
      console.warn("Could not fetch immediate next appointment:", err);
    }
  };

  const fetchAppointments = async () => {
    setStatus({ loading: true, error: null });
    try {
      const res = await doctorService.listAppointments();
      const data = Array.isArray(res.data) ? res.data : (res.data?.appointments || []);
      
      // Filter out pending and cancelled records per criteria
      const validAppointments = data.filter(a => {
        const s = (a.appointment_status || a.status || '').toLowerCase();
        return s !== 'pending' && s !== 'cancelled';
      });

      setAppointments(validAppointments);
      
      setMetrics({
        total: validAppointments.length,
        today: validAppointments.filter(a => isToday(a.appointment_date || a.date)).length,
        confirmed: validAppointments.filter(a => (a.appointment_status || a.status || '').toLowerCase() === 'confirmed').length,
        completed: validAppointments.filter(a => ['completed', 'closed'].includes((a.appointment_status || a.status || '').toLowerCase())).length
      });
      setStatus({ loading: false, error: null });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to fetch appointments stream.' });
    }
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const filterData = () => {
    let result = [...appointments];

    if (activeTab === 'Online') {
      result = result.filter(a => (a.appointment_type || a.type || '').toLowerCase().includes('online'));
    } else if (activeTab === 'Offline') {
      result = result.filter(a => (a.appointment_type || a.type || '').toLowerCase().includes('offline') || (a.appointment_type || a.type || '').toLowerCase().includes('in_person'));
    } else if (activeTab === 'Confirmed') {
      result = result.filter(a => (a.appointment_status || a.status || '').toLowerCase() === 'confirmed');
    } else if (activeTab === 'Completed') {
      result = result.filter(a => ['completed', 'closed'].includes((a.appointment_status || a.status || '').toLowerCase()));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        (a.patient?.username || a.patientName || '').toLowerCase().includes(query) || 
        (a.patient?.email || '').toLowerCase().includes(query) ||
        (a.id || '').toString().includes(query)
      );
    }
    setFilteredAppointments(result);
  };

  return (
    <div className="space-y-6">
      {/* Immediate Next Appointment Highlight Banner */}
      {nextAppointment && nextAppointment.id && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded">⚡ Immediate Next Appointment</span>
            <h4 className="font-bold text-sm mt-1">{nextAppointment.patient?.username || 'Patient'} ({nextAppointment.appointment_type || 'Consultation'})</h4>
            <p className="text-xs text-blue-100">Time: {nextAppointment.appointment_start_time} - {nextAppointment.appointment_end_time}</p>
          </div>
          <button 
            onClick={() => onViewDetails(nextAppointment)}
            className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition shadow-sm"
          >
            Start / View Details
          </button>
        </div>
      )}

      {/* Simplified Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Total Appointments <span className="text-blue-500 text-base">📋</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.total}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Today <span className="text-emerald-500 text-base">📅</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.today}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Confirmed <span className="text-indigo-500 text-base">✅</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.confirmed}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Completed <span className="text-purple-500 text-base">🏁</span></div>
          <div className="text-3xl font-bold text-slate-800 mt-2">{metrics.completed}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex flex-wrap gap-2 bg-slate-100 p-1 rounded-lg self-start">
            {['All', 'Online', 'Offline', 'Confirmed', 'Completed'].map(tab => (
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
              placeholder="Search patient name, email or ID..." 
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
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No matching appointment records found.</td>
                  </tr>
                ) : filteredAppointments.map((item) => (
                  <tr key={`appt-${item.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      <div>{item.patient?.username || item.patientName || 'Patient'}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{item.patient?.email || `ID: ${item.id}`}</div>
                    </td>
                    <td className="p-4">
                      <div>{item.appointment_date ? new Date(item.appointment_date).toLocaleDateString() : item.date}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.appointment_start_time || item.time} - {item.appointment_end_time || ''}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600">
                        {item.appointment_type || item.type || 'General'}
                      </span>
                    </td>
                    <td className="p-4 uppercase text-[10px] font-bold text-slate-500">
                      {item.payment_mode || 'Card'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        ['completed', 'closed'].includes((item.appointment_status || item.status || '').toLowerCase()) ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.appointment_status || item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-4 text-slate-400">
                        <button onClick={() => onViewDetails(item)} className="hover:text-blue-600 transition" title="View Details">
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