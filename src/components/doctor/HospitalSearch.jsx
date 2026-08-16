// src/components/doctor/HospitalSearch.jsx

import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import { 
  Building2, 
  MapPin, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Stethoscope 
} from '../ui/Icons';

export default function HospitalSearch({ onViewHospital }) {
  const [hospitals, setHospitals] = useState([]);
  const [pincode, setPincode] = useState('');
  const [limit] = useState(6);
  const [offset, setOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [status, setStatus] = useState({ loading: false, error: null });

  const fetchHospitals = async (currentOffset = offset, pin = pincode) => {
    setStatus({ loading: true, error: null });
    try {
      const res = await doctorService.filterHospitals('hospital', limit, currentOffset, pin);
      const data = res.data;
      const orgs = data?.organisations || [];
      setHospitals(orgs);
      setTotalRecords(data?.total || (orgs ? orgs.length : 0));
      setStatus({ loading: false, error: null });
    } catch (err) {
      setStatus({ loading: false, error: 'Failed to retrieve hospital network registry.' });
      setHospitals([]);
    }
  };

  useEffect(() => {
    fetchHospitals(offset, pincode);
  }, [offset]);

  const handlePincodeSearch = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchHospitals(0, pincode);
  };

  const parseSpecializations = (specializations) => {
    if (!specializations) return [];
    if (Array.isArray(specializations)) return specializations;
    try {
      return JSON.parse(specializations);
    } catch {
      return [];
    }
  };

  const totalPages = Math.ceil(totalRecords / limit) || 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-800">Affiliated Hospital Registry Discovery</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Lookup verified healthcare institutions by regional pincodes and submit practicing affiliation requests.
        </p>

        <form onSubmit={handlePincodeSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by pincode area parameter (e.g. 500001)..."
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Filter Index
          </button>
        </form>
      </div>

      <Alert type="error" message={status.error} />
      {status.loading && <Loader />}

      {/* Grid of Hospitals */}
      {hospitals.length === 0 && !status.loading ? (
        <div className="p-12 border border-dashed rounded-2xl bg-white text-center text-xs text-slate-400">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          No hospital facilities found matching the criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((h) => {
            const specializations = parseSpecializations(h.specializations_provided);

            return (
              <div
                key={h.id}
                onClick={() => onViewHospital(h)}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={h.profile_picture || 'https://res.cloudinary.com/dwshjkk42/image/upload/v1751270847/hospital-building_4821512_qr0gvo.png'}
                      alt={h.organisation_name || 'Hospital'}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {h.organisation_name || `Hospital Facility #${h.id}`}
                        </h4>
                        {h.verified_status && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {h.address?.street
                          ? `${h.address.street}, ${h.address.city || ''}`
                          : 'Location details available on request'}
                      </p>
                    </div>
                  </div>

                  {h.description && (
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>
                  )}

                  {specializations.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specializations</span>
                      <div className="flex flex-wrap gap-1.5">
                        {specializations.slice(0, 3).map((spec, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200"
                          >
                            <Stethoscope className="w-3 h-3 text-slate-400" /> {spec}
                          </span>
                        ))}
                        {specializations.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5">
                            +{specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] font-medium">
                    {h.ambulance_available ? '🚑 Ambulance' : 'Standard Facility'}
                  </span>
                  <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                    View Details <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalRecords > limit && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200/80 rounded-xl shadow-sm">
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{offset + 1}</span> to{' '}
            <span className="font-bold text-slate-800">{Math.min(offset + limit, totalRecords)}</span> of{' '}
            <span className="font-bold text-slate-800">{totalRecords}</span> hospitals
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
              disabled={offset === 0 || status.loading}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setOffset((prev) => prev + limit)}
              disabled={offset + limit >= totalRecords || status.loading}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}