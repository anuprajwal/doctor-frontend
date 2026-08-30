import React, { useState, useEffect, useMemo } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function ScheduleConfiguration() {
  const [consultationFee, setConsultationFee] = useState(540);
  const [appointmentSlot, setAppointmentSlot] = useState(30);
  const [practiceStartDate, setPracticeStartDate] = useState('');

  const [schedule, setSchedule] = useState([
    { day: "monday", loginTime: "09:00", logoutTime: "17:00", breaks: ["12:00-12:30"], mode: "online", active: true },
    { day: "tuesday", loginTime: "10:00", logoutTime: "12:00", breaks: ["13:00-13:45"], mode: "offline", active: true },
    { day: "wednesday", loginTime: "11:30", logoutTime: "18:00", breaks: ["12:30-13:00", "15:30-15:45"], mode: "online", active: true },
    { day: "thursday", loginTime: "09:00", logoutTime: "15:00", breaks: ["11:30-12:00"], mode: "hybrid", active: true },
    { day: "friday", loginTime: "10:00", logoutTime: "14:00", breaks: ["12:00-12:15"], mode: "offline", active: true },
    { day: "saturday", loginTime: "11:00", logoutTime: "13:00", breaks: [], mode: "online", active: true },
    { day: "sunday", loginTime: "", logoutTime: "", breaks: [], mode: "", active: false }
  ]);

  // Transient state for adding new breaks per day card
  const [newBreaks, setNewBreaks] = useState({});
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        const res = await doctorService.getUserData();
        const profile = res.data?.userData?.doctorProfile || {};
        if (profile.practice_start_date) {
          setPracticeStartDate(profile.practice_start_date.slice(0, 7));
        }
        if (profile.consultation_fee) {
          setConsultationFee(profile.consultation_fee);
        }
      } catch (err) {
        // Fallback gracefully if profile data fetch fails
      }
    };
    loadDoctorData();
  }, []);

  // Compute years & months of experience from practice_start_date
  const experienceText = useMemo(() => {
    if (!practiceStartDate) return 'Not configured';

    const [startYear, startMonth] = practiceStartDate.split('-').map(Number);
    if (!startYear || !startMonth) return 'Not configured';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    if (totalMonths < 0) return 'Future Start Date';

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const yearStr = years > 0 ? `${years} ${years === 1 ? 'yr' : 'yrs'}` : '';
    const monthStr = months > 0 ? `${months} ${months === 1 ? 'mo' : 'mos'}` : '';

    if (yearStr && monthStr) return `${yearStr} ${monthStr}`;
    if (yearStr) return yearStr;
    if (monthStr) return monthStr;
    return '< 1 mo';
  }, [practiceStartDate]);

  const handleToggleDay = (index) => {
    setSchedule(prev => prev.map((item, idx) => idx === index ? { ...item, active: !item.active } : item));
  };

  const updateScheduleField = (index, field, value) => {
    setSchedule(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  // Add custom break interval
  const handleAddBreak = (index) => {
    const entry = newBreaks[index] || {};
    if (!entry.start || !entry.end) return;

    const breakSlot = `${entry.start}-${entry.end}`;
    setSchedule(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const existingBreaks = item.breaks || [];
      if (existingBreaks.includes(breakSlot)) return item;
      return { ...item, breaks: [...existingBreaks, breakSlot] };
    }));

    // Reset input fields for this specific card
    setNewBreaks(prev => ({ ...prev, [index]: { start: '', end: '' } }));
  };

  // Remove existing break interval
  const handleRemoveBreak = (dayIndex, breakIndex) => {
    setSchedule(prev => prev.map((item, idx) => {
      if (idx !== dayIndex) return item;
      return { ...item, breaks: item.breaks.filter((_, bIdx) => bIdx !== breakIndex) };
    }));
  };

  const handleSaveAllSettings = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const formattedSchedule = schedule.map((item) => {
        if (!item.active) {
          return {
            day: item.day,
            loginTime: "",
            logoutTime: "",
            breaks: [],
            mode: ""
          };
        }
        return {
          day: item.day,
          loginTime: item.loginTime,
          logoutTime: item.logoutTime,
          breaks: item.breaks || [],
          mode: item.mode || 'online'
        };
      });

      const payload = {
        availability_schedule: formattedSchedule,
        consultation_fee: Number(consultationFee),
        appointment_slot: Number(appointmentSlot)
      };

      await doctorService.updateExtraInfo(payload);
      setStatus({ loading: false, error: null, success: 'Schedule matrix successfully saved to server.' });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed updating availability setup data.', success: null });
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-10 space-y-8 px-4">
      {/* Configuration Header Card */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-full md:w-1/3 h-32 rounded-lg bg-slate-100 flex items-center justify-center text-4xl overflow-hidden">
          📅
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Consultation Fee (₹)</label>
            <input 
              type="number" 
              value={consultationFee} 
              onChange={(e) => setConsultationFee(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Calculated Experience</label>
            <div className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-blue-700 font-semibold truncate flex items-center h-[38px]">
              {experienceText}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Slot Duration</label>
            <select 
              value={appointmentSlot} 
              onChange={(e) => setAppointmentSlot(e.target.value)} 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:border-blue-500 outline-none"
            >
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={60}>60 mins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Schedule Setup Block */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Availability Schedule</h3>
        <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
        {status.loading && <Loader />}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedule.map((sched, index) => (
            <div 
              key={sched.day} 
              className={`p-5 rounded-xl border transition-all ${
                sched.active ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/5' : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold capitalize text-slate-800">{sched.day}</span>
                <input 
                  type="checkbox" 
                  checked={sched.active} 
                  onChange={() => handleToggleDay(index)} 
                  className="w-9 h-5 bg-slate-200 rounded-full appearance-none checked:bg-blue-600 transition-colors cursor-pointer relative before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform" 
                />
              </div>

              {sched.active && (
                <div className="space-y-3 text-xs">
                  {/* Login / Logout Timing */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-1 font-medium">Login</label>
                      <input 
                        type="time" 
                        value={sched.loginTime} 
                        onChange={(e) => updateScheduleField(index, 'loginTime', e.target.value)} 
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1 font-medium">Logout</label>
                      <input 
                        type="time" 
                        value={sched.logoutTime} 
                        onChange={(e) => updateScheduleField(index, 'logoutTime', e.target.value)} 
                        className="w-full p-2 border border-slate-300 rounded bg-white text-slate-800 outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  {/* Dynamic Break Selector & List */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-medium">Scheduled Breaks</label>
                    <div className="p-2 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
                      {/* Active Breaks Badges */}
                      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
                        {sched.breaks && sched.breaks.length > 0 ? (
                          sched.breaks.map((brk, bIdx) => (
                            <span 
                              key={bIdx} 
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[11px] shadow-sm"
                            >
                              {brk}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveBreak(index, bIdx)} 
                                className="text-slate-400 hover:text-rose-600 transition"
                              >
                                <TrashIcon />
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No breaks added.</span>
                        )}
                      </div>

                      {/* Add Break Input Sub-row */}
                      <div className="flex items-center gap-1 pt-1 border-t border-slate-200">
                        <input
                          type="time"
                          value={newBreaks[index]?.start || ''}
                          onChange={(e) => setNewBreaks(prev => ({
                            ...prev,
                            [index]: { ...prev[index], start: e.target.value }
                          }))}
                          className="w-full p-1 text-[11px] border border-slate-300 rounded bg-white outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400 text-[10px]">to</span>
                        <input
                          type="time"
                          value={newBreaks[index]?.end || ''}
                          onChange={(e) => setNewBreaks(prev => ({
                            ...prev,
                            [index]: { ...prev[index], end: e.target.value }
                          }))}
                          className="w-full p-1 text-[11px] border border-slate-300 rounded bg-white outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddBreak(index)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded text-[11px] transition shrink-0"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mode Selection */}
                  <div>
                    <label className="text-slate-500 block mb-1 font-medium">Mode Selection</label>
                    <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                      {['online', 'offline', 'hybrid'].map((m) => (
                        <button 
                          key={m} 
                          type="button" 
                          onClick={() => updateScheduleField(index, 'mode', m)} 
                          className={`flex-1 py-1.5 font-semibold capitalize transition text-xs ${
                            sched.mode === m ? 'bg-blue-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button 
          type="button" 
          onClick={handleSaveAllSettings} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow transition"
        >
          Save Availability Settings
        </button>
      </div>
    </div>
  );
}