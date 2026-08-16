// src/components/doctor/HospitalDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Loader from '../ui/Loader';
import Alert from '../ui/Alert';
import { 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Award, 
  Calendar, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Stethoscope, 
  Clock 
} from '../ui/Icons';

export default function HospitalDetailPage({ hospital, onBack }) {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [docOffset, setDocOffset] = useState(0);
  const [docLimit] = useState(6);
  const [totalDocs, setTotalDocs] = useState(0);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    if (hospital?.user_id) {
      fetchDoctors(hospital.user_id, docOffset);
    }
  }, [hospital?.user_id, docOffset]);

  const fetchDoctors = async (orgId, currentDocOffset) => {
    setLoadingDoctors(true);
    try {
      const res = await doctorService.getHospitalDoctors(orgId, docLimit, currentDocOffset);
      const data = res.data;
      setDoctors(data?.doctors || []);
      setTotalDocs(data?.pagination?.total_records || data?.total || (data?.doctors ? data.doctors.length : 0));
    } catch (err) {
      setDoctors([]);
      setTotalDocs(0);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSendJoinRequest = async () => {
    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.requestAdmission(hospital.id);
      setStatus({ 
        loading: false, 
        error: null, 
        success: 'Admission request successfully forwarded to the hospital administration.' 
      });
    } catch (err) {
      setStatus({ 
        loading: false, 
        error: err.response?.data?.message || 'Admission request failed. Please try again.', 
        success: null 
      });
    }
  };

  const parseSpecializations = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  const specializations = parseSpecializations(hospital?.specializations_provided);
  const docCurrentPage = Math.floor(docOffset / docLimit) + 1;
  const docTotalPages = Math.ceil(totalDocs / docLimit) || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Return Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Hospital Discovery
      </button>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />

      {/* Hospital Detailed Overview Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={hospital?.profile_picture || 'https://res.cloudinary.com/dwshjkk42/image/upload/v1751270847/hospital-building_4821512_qr0gvo.png'}
              alt={hospital?.organisation_name || 'Hospital Profile'}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
            />

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {hospital?.organisation_name || `Hospital Facility #${hospital?.id}`}
                </h1>
                {hospital?.verified_status && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-xs sm:text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {hospital?.address?.street
                  ? `${hospital.address.street}, ${hospital.address.city || ''} - ${hospital.address.pincode || ''}`
                  : 'Address details available upon request'}
              </p>

              <div className="flex flex-wrap gap-2.5 pt-1 text-xs text-slate-600 font-medium">
                {hospital?.regestration_number && (
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Award className="w-3.5 h-3.5 text-blue-500" /> Reg: {hospital.regestration_number}
                  </span>
                )}
                {hospital?.establishment_year && (
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Est: {hospital.establishment_year}
                  </span>
                )}
                {hospital?.website_url && (
                  <a
                    href={hospital.website_url.startsWith('http') ? hospital.website_url : `https://${hospital.website_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" /> {hospital.website_url}
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSendJoinRequest}
            disabled={status.loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm self-start transition whitespace-nowrap"
          >
            {status.loading ? 'Submitting...' : 'Request Admission'}
          </button>
        </div>

        {hospital?.description && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hospital Overview</h3>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{hospital.description}</p>
          </div>
        )}

        {specializations.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Departments & Clinical Offerings</h3>
            <div className="flex flex-wrap gap-2">
              {specializations.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hospital Doctors Registry Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Practicing Doctors</h2>
          <p className="text-slate-500 text-xs mt-0.5">Specialists actively operating within this hospital network.</p>
        </div>

        {loadingDoctors ? (
          <Loader />
        ) : doctors.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-xs font-medium">No doctors currently listed under this hospital facility.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const profile = doc.doctorProfile || doc;
              const doctorUser = doc.user || doc;

              return (
                <div
                  key={doc.id || profile.id}
                  className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-start gap-3.5"
                >
                  <img
                    src={profile.profile_picture || 'https://res.cloudinary.com/dwshjkk42/image/upload/v1751270760/doctor_8997187_mgopyu.png'}
                    alt="Doctor"
                    className="w-12 h-12 rounded-full object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {doctorUser.username || profile.full_name || 'Dr. Practitioner'}
                    </h4>
                    <p className="text-blue-600 text-xs font-semibold mt-0.5 truncate">
                      {profile.specialization || 'General Specialist'}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {profile.experience_years ? `${profile.experience_years} years experience` : 'Practitioner'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span className="font-bold text-slate-900">₹ {profile.consultation_fee || '500.00'}</span>
                      {profile.appointment_time && (
                        <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Clock className="w-3 h-3" /> {profile.appointment_time} mins
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Doctor Pagination */}
        {totalDocs > docLimit && (
          <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200/80 rounded-xl shadow-sm mt-4">
            <span className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{docOffset + 1}</span> to{' '}
              <span className="font-bold text-slate-800">{Math.min(docOffset + docLimit, totalDocs)}</span> of{' '}
              <span className="font-bold text-slate-800">{totalDocs}</span> doctors
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDocOffset((prev) => Math.max(0, prev - docLimit))}
                disabled={docOffset === 0 || loadingDoctors}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-700 px-1">
                Page {docCurrentPage} of {docTotalPages}
              </span>
              <button
                onClick={() => setDocOffset((prev) => prev + docLimit)}
                disabled={docOffset + docLimit >= totalDocs || loadingDoctors}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}