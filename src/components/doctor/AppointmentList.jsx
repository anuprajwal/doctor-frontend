// src/components/doctor/AppointmentList.jsx

import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import { GitBranch, Calendar, Clock, ChevronRight, Eye } from '../ui/Icons';
export default function AppointmentList({ onViewDetails }) {
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
      const res = await fetch('https://api.docapp.co.in/api/appointment/next', {
        headers: { Authorization: `Bearer ${getCookie('auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNextAppointment(data?.appointment || data);
      }
    } catch (err) {
      console.warn("Could not fetch next appointment summary:", err);
    }
  };

  const fetchAppointments = async () => {
    setStatus({ loading: true, error: null });
    try {
      const res = await doctorService.listAppointments();
      const data = Array.isArray(res.data) ? res.data : (res.data?.appointments || []);
      
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
      setStatus({ loading: false, error: 'Failed to fetch appointments list.' });
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
            type="button"
            className="px-3 py-1.5 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition shadow-sm"
          >
            View Details
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex justify-between text-slate-400 text-sm font-medium">Total Consultations <span className="text-blue-500 text-base">📋</span></div>
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
                type="button"
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
          <div className="p-4 space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium border border-dashed rounded-xl bg-slate-50/50">
                No matching appointment records found.
              </div>
            ) : filteredAppointments.map((item) => {
              const checkups = Array.isArray(item.checkupAppointment) ? item.checkupAppointment : [];
              const dateFormatted = item.appointment_date 
                ? new Date(item.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) 
                : item.date;

              return (
                <div key={`appointment-row-${item.id}`} className="relative">
                  {/* Primary Appointment Row Node */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 flex-shrink-0">
                        {item.patient?.username?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            #{item.id} Primary
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm">
                            {item.patient?.username || item.patientName || 'Patient Record'}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {dateFormatted}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.appointment_start_time?.substring(0, 5)} - {item.appointment_end_time?.substring(0, 5)}
                          </span>
                          <span className="uppercase text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {item.appointment_type || item.type || 'Online'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        ['completed', 'closed'].includes((item.appointment_status || item.status || '').toLowerCase())
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {item.appointment_status || item.status}
                      </span>
                      <button
                        onClick={() => onViewDetails(item)}
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </div>
                  </div>

                  {/* Branch Hierarchy Connecting Lines for Checkup Appointments */}
                  {checkups.length > 0 && (
                    <div className="ml-6 sm:ml-10 relative mt-2 space-y-2">
                      <div className="absolute -top-3 bottom-4 left-0 w-0.5 border-l-2 border-dashed border-emerald-400" />
                      {checkups.map((checkup) => {
                        const checkupDateFormatted = checkup.checkup_date 
                          ? new Date(checkup.checkup_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) 
                          : 'N/A';

                        return (
                          <div key={`checkup-sub-${checkup.id}`} className="relative flex items-center">
                            <div className="w-6 sm:w-8 h-0.5 border-b-2 border-dashed border-emerald-400" />
                            <div 
                              onClick={() => onViewDetails(item)}
                              className="flex-1 bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-emerald-100/70 transition shadow-sm"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                                  <GitBranch className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                                      Checkup #{checkup.id}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">
                                      Follow-up Session
                                    </span>
                                    {checkup.is_payment_required === false && (
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                                        FREE
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                                    <span>{checkupDateFormatted}</span>
                                    <span>{checkup.checkup_start_time?.substring(0, 5)} - {checkup.checkup_end_time?.substring(0, 5)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200">
                                  {checkup.checkup_status || 'Confirmed'}
                                </span>
                                <span className="text-xs font-bold text-emerald-700 flex items-center">
                                  Manage <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}