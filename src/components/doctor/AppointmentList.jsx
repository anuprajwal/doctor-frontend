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

  // Metric State Cards
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
      const data = res.data || [];
      setAppointments(data);
      
      // Compute dashboard summary indicators
      setMetrics({
        today: data.filter(a => a.timeCategory === 'today').length,
        upcoming: data.filter(a => a.status === 'CONFIRMED').length,
        pending: data.filter(a => a.status === 'PENDING').length,
        cancelled: data.filter(a => a.status === 'CANCELLED').length
      });
      setStatus({ loading: false, error: null });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to balance metrics streams from server environment.' });
    }
  };

  const filterData = () => {
    let result = [...appointments];

    // Filter by tab mappings
    if (activeTab !== 'All') {
      result = result.filter(a => a.type?.toLowerCase() === activeTab.toLowerCase());
    }

    // Filter by query string values
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.patientName?.toLowerCase().includes(query) || 
        a.patientId?.toLowerCase().includes(query) ||
        a.reason?.toLowerCase().includes(query)
      );
    }
    setFilteredAppointments(result);
  };

  return (
    <div class="space-y-6">
      {/* Top Cards Section Block */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="flex justify-between text-slate-400 text-sm font-medium">Today <span class="text-blue-500 text-base">📅</span></div>
          <div class="text-3xl font-bold text-slate-800 mt-2">{metrics.today}</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1">↑ 4 from yesterday</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="flex justify-between text-slate-400 text-sm font-medium">Upcoming <span class="text-blue-500 text-base">📤</span></div>
          <div class="text-3xl font-bold text-slate-800 mt-2">{metrics.upcoming}</div>
          <div class="text-xs text-slate-400 mt-1">Next 7 days</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="flex justify-between text-slate-400 text-sm font-medium">Pending <span class="text-amber-500 text-base">📋</span></div>
          <div class="text-3xl font-bold text-slate-800 mt-2">{metrics.pending}</div>
          <div class="text-xs text-amber-600 font-semibold mt-1">Requires action</div>
        </div>
        <div class="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm">
          <div class="flex justify-between text-slate-400 text-sm font-medium">Cancelled <span class="text-red-500 text-base">❌</span></div>
          <div class="text-3xl font-bold text-slate-800 mt-2">{metrics.cancelled}</div>
          <div class="text-xs text-red-500 font-semibold mt-1">-10% from last week</div>
        </div>
      </div>

      {/* Interactive Filtering Layer */}
      <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div class="flex gap-2 bg-slate-100 p-1 rounded-lg self-start">
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
          <div class="relative w-full sm:w-72">
            <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Search patient name, ID or reason..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              class="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Data Presentation Table Area */}
        <Alert type="error" message={status.error} />
        {status.loading ? <Loader /> : (
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th class="p-4">Patient Name</th>
                  <th class="p-4">Date & Time</th>
                  <th class="p-4">Type</th>
                  <th class="p-4">Reason</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" class="p-8 text-center text-slate-400 font-medium">No matching appointment records found inside database view.</td>
                  </tr>
                ) : filteredAppointments.map(item => (
                  <tr key={item.id} class="hover:bg-slate-50/80 transition-colors">
                    <td class="p-4 font-semibold text-slate-800">
                      <div>{item.patientName}</div>
                      <div class="text-[10px] text-slate-400 font-normal mt-0.5">ID: {item.patientId}</div>
                    </td>
                    <td class="p-4">
                      <div>{item.date}</div>
                      <div class="text-[10px] text-slate-400 mt-0.5">{item.time}</div>
                    </td>
                    <td class="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        item.type?.toLowerCase() === 'online' ? 'bg-blue-50 text-blue-600' :
                        item.type?.toLowerCase() === 'emergency' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td class="p-4 max-w-xs truncate text-slate-500">{item.reason || 'Routine general clinical assessment checkup.'}</td>
                    <td class="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                        item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        item.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td class="p-4">
                      <div class="flex items-center justify-center gap-4 text-slate-400">
                        <button onClick={() => onViewDetails(item)} class="hover:text-blue-600 transition" title="View Appointment Details">
                          👁️ <span class="sr-only">Details</span>
                        </button>
                        <button onClick={() => onViewPrescription(item)} class="hover:text-emerald-600 transition" title="Prescription Workspace">
                          📝 <span class="sr-only">Prescription</span>
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