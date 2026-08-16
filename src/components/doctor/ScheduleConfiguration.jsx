import React, { useState } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ScheduleConfiguration() {
  const [consultationFee, setConsultationFee] = useState(540);
  const [experienceYears, setExperienceYears] = useState(2);
  const [appointmentSlot, setAppointmentSlot] = useState(30);

  const [schedule, setSchedule] = useState([
    { day: "monday", loginTime: "09:00", logoutTime: "17:00", breaks: ["12:00-12:30"], mode: "online", active: true },
    { day: "tuesday", loginTime: "10:00", logoutTime: "12:00", breaks: ["13:00-13:45"], mode: "offline", active: true },
    { day: "wednesday", loginTime: "11:30", logoutTime: "18:00", breaks: ["12:30-13:00", "15:30-15:45"], mode: "online", active: true },
    { day: "thursday", loginTime: "09:00", logoutTime: "15:00", breaks: ["11:30-12:00"], mode: "hybrid", active: true },
    { day: "friday", loginTime: "10:00", logoutTime: "14:00", breaks: ["12:00-12:15"], mode: "offline", active: true },
    { day: "saturday", loginTime: "11:00", logoutTime: "13:00", breaks: [], mode: "online", active: true },
    { day: "sunday", loginTime: "", logoutTime: "", breaks: [], mode: "", active: false }
  ]);

  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleToggleDay = (index) => {
    setSchedule(prev => prev.map((item, idx) => idx === index ? { ...item, active: !item.active } : item));
  };

  const updateScheduleField = (index, field, value) => {
    setSchedule(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleSaveAllSettings = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      // Clear times, breaks, and mode if the day is toggled off
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
        experience_years: Number(experienceYears),
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
            <input type="number" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Experience Years</label>
            <input type="number" value={experienceYears} disabled className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Slot Duration</label>
            <select value={appointmentSlot} onChange={(e) => setAppointmentSlot(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
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
            <div key={sched.day} className={`p-5 rounded-xl border transition-all ${sched.active ? 'bg-white border-blue-500 shadow-sm ring-2 ring-blue-500/5' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-1">Login</label>
                      <input type="time" value={sched.loginTime} onChange={(e) => updateScheduleField(index, 'loginTime', e.target.value)} className="w-full p-2 border rounded bg-white text-slate-800" />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">Logout</label>
                      <input type="time" value={sched.logoutTime} onChange={(e) => updateScheduleField(index, 'logoutTime', e.target.value)} className="w-full p-2 border rounded bg-white text-slate-800" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">Breaks Matrix</label>
                    <div className="text-slate-700 bg-slate-100 p-2 rounded max-h-16 overflow-y-auto">
                      {sched.breaks.length > 0 ? sched.breaks.join(', ') : 'No break records.'}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">Mode Selection</label>
                    <div className="flex border rounded overflow-hidden">
                      {['online', 'offline', 'hybrid'].map((m) => (
                        <button key={m} type="button" onClick={() => updateScheduleField(index, 'mode', m)} className={`flex-1 py-1.5 font-semibold capitalize transition ${sched.mode === m ? 'bg-blue-600 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'}`}>
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
        <button type="button" onClick={handleSaveAllSettings} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow transition">
          Save Availability Settings
        </button>
      </div>
    </div>
  );
}