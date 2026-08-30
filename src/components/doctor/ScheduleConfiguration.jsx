import React, { useState, useEffect, useMemo } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import { 
  Info, 
  Plus, 
  X, 
  Copy, 
  RotateCcw, 
  Clock, 
  Check, 
  ChevronDown 
} from 'lucide-react';

// Helper to convert 24h "HH:mm" to 12h display string "hh:mm AM/PM"
const formatTo12Hour = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

// Helper to compare "HH:mm" strings in minutes
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
};

const DAY_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

const DEFAULT_SCHEDULE = [
  { day: "monday", loginTime: "09:00", logoutTime: "17:00", breaks: ["12:00-12:30"], mode: "online", active: true },
  { day: "tuesday", loginTime: "09:00", logoutTime: "17:00", breaks: ["13:00-13:45"], mode: "offline", active: true },
  { day: "wednesday", loginTime: "09:00", logoutTime: "17:00", breaks: ["12:30-13:00"], mode: "online", active: true },
  { day: "thursday", loginTime: "09:00", logoutTime: "17:00", breaks: ["11:30-12:00"], mode: "hybrid", active: true },
  { day: "friday", loginTime: "09:00", logoutTime: "17:00", breaks: ["12:00-12:15"], mode: "offline", active: true },
  { day: "saturday", loginTime: "10:00", logoutTime: "14:00", breaks: [], mode: "online", active: true },
  { day: "sunday", loginTime: "", logoutTime: "", breaks: [], mode: "", active: false }
];

export default function ScheduleConfiguration() {
  const [consultationFee, setConsultationFee] = useState(500);
  const [appointmentSlot, setAppointmentSlot] = useState(30);
  const [practiceStartDate, setPracticeStartDate] = useState('');
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [initialSchedule, setInitialSchedule] = useState(DEFAULT_SCHEDULE);

  // Active day index currently showing inline break adder
  const [activeBreakAdder, setActiveBreakAdder] = useState(null);
  const [newBreak, setNewBreak] = useState({ start: '', end: '' });
  const [breakError, setBreakError] = useState('');

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
        if (profile.appointment_time) {
          setAppointmentSlot(profile.appointment_time);
        }
        if (Array.isArray(profile.availability_schedule) && profile.availability_schedule.length > 0) {
          const mapped = profile.availability_schedule.map(item => ({
            ...item,
            active: Boolean(item.loginTime && item.logoutTime)
          }));
          setSchedule(mapped);
          setInitialSchedule(mapped);
        }
      } catch (err) {
        // Fallback to defaults
      }
    };
    loadDoctorData();
  }, []);

  // Compute experience text
  const experienceText = useMemo(() => {
    if (!practiceStartDate) return 'Not configured';

    const [startYear, startMonth] = practiceStartDate.split('-').map(Number);
    if (!startYear || !startMonth) return 'Not configured';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);
    if (totalMonths < 0) return 'Future Start';

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const yearStr = years > 0 ? `${years} yrs` : '';
    const monthStr = months > 0 ? `${months} mos` : '';

    if (yearStr && monthStr) return `${yearStr} ${monthStr}`;
    if (yearStr) return yearStr;
    if (monthStr) return monthStr;
    return '< 1 mo';
  }, [practiceStartDate]);

  const handleToggleDay = (index) => {
    setSchedule(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      const willBeActive = !item.active;
      return {
        ...item,
        active: willBeActive,
        loginTime: willBeActive ? (item.loginTime || '09:00') : '',
        logoutTime: willBeActive ? (item.logoutTime || '17:00') : '',
        mode: willBeActive ? (item.mode || 'online') : '',
        breaks: willBeActive ? item.breaks : []
      };
    }));
  };

  const updateScheduleField = (index, field, value) => {
    setSchedule(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleOpenBreakAdder = (index) => {
    setActiveBreakAdder(index);
    setNewBreak({ start: '', end: '' });
    setBreakError('');
  };

  // Inline break addition validation
  const handleConfirmAddBreak = (index) => {
    const dayItem = schedule[index];
    if (!newBreak.start || !newBreak.end) {
      setBreakError('Both start and end times are required.');
      return;
    }

    const bStart = timeToMinutes(newBreak.start);
    const bEnd = timeToMinutes(newBreak.end);
    const login = timeToMinutes(dayItem.loginTime);
    const logout = timeToMinutes(dayItem.logoutTime);

    if (bStart >= bEnd) {
      setBreakError('Break start time must be earlier than end time.');
      return;
    }

    if (bStart < login || bEnd > logout) {
      setBreakError(`Break must be within working hours (${formatTo12Hour(dayItem.loginTime)} - ${formatTo12Hour(dayItem.logoutTime)}).`);
      return;
    }

    const breakSlot = `${newBreak.start}-${newBreak.end}`;
    if ((dayItem.breaks || []).includes(breakSlot)) {
      setBreakError('This break slot is already added.');
      return;
    }

    setSchedule(prev => prev.map((item, idx) => {
      if (idx !== index) return item;
      return { ...item, breaks: [...(item.breaks || []), breakSlot] };
    }));

    setActiveBreakAdder(null);
    setNewBreak({ start: '', end: '' });
    setBreakError('');
  };

  const handleRemoveBreak = (dayIndex, breakIndex) => {
    setSchedule(prev => prev.map((item, idx) => {
      if (idx !== dayIndex) return item;
      return { ...item, breaks: item.breaks.filter((_, bIdx) => bIdx !== breakIndex) };
    }));
  };

  // Copy schedule from one day to all other active days
  const handleCopyDaySchedule = (fromIndex) => {
    const source = schedule[fromIndex];
    if (!source.active) return;

    setSchedule(prev => prev.map((item, idx) => {
      if (idx === fromIndex || !item.active) return item;
      return {
        ...item,
        loginTime: source.loginTime,
        logoutTime: source.logoutTime,
        mode: source.mode,
        breaks: [...source.breaks]
      };
    }));
    setStatus({ loading: false, error: null, success: `Copied ${DAY_LABELS[source.day]}'s schedule to all active days.` });
  };

  // Reset a specific day back to defaults
  const handleResetDay = (dayIndex) => {
    setSchedule(prev => prev.map((item, idx) => {
      if (idx !== dayIndex) return item;
      return { ...DEFAULT_SCHEDULE[idx] };
    }));
  };

  const handleDiscardChanges = () => {
    setSchedule(initialSchedule);
    setStatus({ loading: false, error: null, success: 'Changes reverted.' });
  };

  // Validation function prior to backend dispatch
  const validateSchedule = () => {
    for (const item of schedule) {
      if (!item.active) continue;

      const dayName = DAY_LABELS[item.day] || item.day;

      if (!item.loginTime || !item.logoutTime) {
        return `Please specify both Login and Logout times for ${dayName}.`;
      }

      const login = timeToMinutes(item.loginTime);
      const logout = timeToMinutes(item.logoutTime);

      if (login >= logout) {
        return `On ${dayName}, Login Time (${formatTo12Hour(item.loginTime)}) must be earlier than Logout Time (${formatTo12Hour(item.logoutTime)}).`;
      }

      if (item.breaks && item.breaks.length > 0) {
        for (const brk of item.breaks) {
          const [bStartStr, bEndStr] = brk.split('-');
          if (!bStartStr || !bEndStr) continue;

          const bStart = timeToMinutes(bStartStr);
          const bEnd = timeToMinutes(bEndStr);

          if (bStart >= bEnd) {
            return `On ${dayName}, break ${formatTo12Hour(bStartStr)} - ${formatTo12Hour(bEndStr)} has an invalid start and end range.`;
          }

          if (bStart < login || bEnd > logout) {
            return `On ${dayName}, the break ${formatTo12Hour(bStartStr)} - ${formatTo12Hour(bEndStr)} exceeds your working hours (${formatTo12Hour(item.loginTime)} to ${formatTo12Hour(item.logoutTime)}). Please adjust the break or working hours.`;
          }
        }
      }
    }
    return null;
  };

  const handleSaveAllSettings = async () => {
    setStatus({ loading: false, error: null, success: null });

    // Validate before dispatching request
    const validationError = validateSchedule();
    if (validationError) {
      setStatus({ loading: false, error: validationError, success: null });
      return;
    }

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
      setInitialSchedule(schedule);
      setStatus({ loading: false, error: null, success: 'Schedule matrix successfully saved to server.' });
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'Failed updating availability setup data.', success: null });
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-6 space-y-6 px-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Schedule Configuration</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your consultation fees, appointment durations, and weekly working hours.</p>
      </div>

      <Alert 
        type={status.success ? 'success' : 'error'} 
        message={status.success || status.error} 
        onClose={() => setStatus({ loading: false, error: null, success: null })}
      />
      {status.loading && <Loader />}

      {/* Top Configuration Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Consultation Fee */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Consultation Fee</label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-semibold text-slate-400">₹</span>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                placeholder="500"
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Slot Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Slot Duration</label>
            <div className="relative">
              <select
                value={appointmentSlot}
                onChange={(e) => setAppointmentSlot(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition appearance-none cursor-pointer"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-xs font-semibold text-slate-700">Experience</label>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="w-fit min-w-[120px] px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
              {experienceText}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Working Hours Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Weekly Working Hours</h2>

        <div className="divide-y divide-slate-100">
          {schedule.map((sched, index) => {
            const dayLabel = DAY_LABELS[sched.day] || sched.day;
            const isAdderOpen = activeBreakAdder === index;

            return (
              <div 
                key={sched.day} 
                className={`py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  !sched.active ? 'opacity-60' : ''
                }`}
              >
                {/* Left Side: Toggle Switch & Day Label */}
                <div className="flex items-center gap-4 min-w-[100px]">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sched.active}
                      onChange={() => handleToggleDay(index)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                  <span className={`text-sm font-bold ${sched.active ? 'text-slate-800' : 'text-slate-400'}`}>
                    {dayLabel}
                  </span>
                </div>

                {/* Center Content: Active Working Configuration or Unavailable */}
                {sched.active ? (
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    {/* Time Inputs */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center">
                        <input
                          type="time"
                          value={sched.loginTime}
                          onChange={(e) => updateScheduleField(index, 'loginTime', e.target.value)}
                          className="px-3 py-1.5 pr-8 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">to</span>
                      <div className="relative flex items-center">
                        <input
                          type="time"
                          value={sched.logoutTime}
                          onChange={(e) => updateScheduleField(index, 'logoutTime', e.target.value)}
                          className="px-3 py-1.5 pr-8 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Mode Selector Segment */}
                    <div className="inline-flex bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                      {['online', 'offline', 'hybrid'].map((m) => {
                        const isSelected = (sched.mode || 'online').toLowerCase() === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => updateScheduleField(index, 'mode', m)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>

                    {/* Breaks List */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(sched.breaks || []).map((brk, bIdx) => {
                        const [start, end] = brk.split('-');
                        return (
                          <span
                            key={bIdx}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50/70 border border-blue-100 text-blue-800 rounded-xl text-xs font-semibold"
                          >
                            {formatTo12Hour(start)} - {formatTo12Hour(end)}
                            <button
                              type="button"
                              onClick={() => handleRemoveBreak(index, bIdx)}
                              className="text-blue-500 hover:text-blue-800 ml-0.5 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}

                      {/* Add Break Button or Inline Form */}
                      {!isAdderOpen ? (
                        <button
                          type="button"
                          onClick={() => handleOpenBreakAdder(index)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Break
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                          <input
                            type="time"
                            value={newBreak.start}
                            onChange={(e) => setNewBreak(prev => ({ ...prev, start: e.target.value }))}
                            className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500"
                          />
                          <span className="text-[10px] text-slate-400">to</span>
                          <input
                            type="time"
                            value={newBreak.end}
                            onChange={(e) => setNewBreak(prev => ({ ...prev, end: e.target.value }))}
                            className="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleConfirmAddBreak(index)}
                            className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            title="Confirm"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveBreakAdder(null);
                              setBreakError('');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 text-xs text-slate-400 italic">
                    Unavailable
                  </div>
                )}

                {/* Right Actions: Copy Schedule & Reset Day */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    type="button"
                    onClick={() => handleCopyDaySchedule(index)}
                    disabled={!sched.active}
                    title="Copy to all active days"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResetDay(index)}
                    title="Reset day schedule"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Break Inline Error Toast */}
        {breakError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>{breakError}</span>
            <button onClick={() => setBreakError('')} className="text-rose-400 hover:text-rose-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 font-medium">
          © 2026 DocApp. HIPAA Compliant Secure Medical Portal.
        </p>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleDiscardChanges}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={handleSaveAllSettings}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            Save Availability Settings
          </button>
        </div>
      </div>
    </div>
  );
}