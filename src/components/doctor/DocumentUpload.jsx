import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import { CheckCircle2, XCircle, AlertTriangle, FileText, Upload, Sparkles, HelpCircle } from 'lucide-react';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState({
    aadharcard: { status: 'Pending', url: '', fileName: '' },
    license: { status: 'Pending', url: '', fileName: '' },
    mbbs_certificate: { status: 'Pending', url: '', fileName: '' }
  });
  const [wildcards, setWildcards] = useState([]);
  const [newDocName, setNewDocName] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    fetchExistingDocuments();
  }, []);

  const fetchExistingDocuments = async () => {
    try {
      const res = await doctorService.getDocuments();
      const docList = res.data?.userDocuments || [];

      if (Array.isArray(docList)) {
        setDocuments(prev => {
          const updated = { ...prev };
          const dynamicDocs = [];

          docList.forEach(d => {
            const docKey = d.document_type;
            const docUrl = d.document_url;

            if (updated[docKey]) {
              updated[docKey] = { status: 'Uploaded', url: docUrl, fileName: docKey };
            } else {
              dynamicDocs.push({ name: docKey, status: 'Uploaded', url: docUrl, label: docKey });
            }
          });

          setWildcards(dynamicDocs);
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed fetching documents:", err);
    }
  };

  const validateAndUpload = async (keyName, file) => {
    if (!file) return;

    // Client-side strict validation: Maximum 1 MB (1024 * 1024 bytes)
    const MAX_SIZE_BYTES = 1 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (file.size > MAX_SIZE_BYTES) {
      setStatus({
        loading: false,
        error: `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 1 MB size limit. Please compress or crop the image and try again.`,
        success: null
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setStatus({
        loading: false,
        error: `Invalid file format (${file.type || 'unknown'}). Please upload a JPEG, PNG, or PDF file.`,
        success: null
      });
      return;
    }

    const data = new FormData();
    data.append('document', file);
    data.append('documentName', keyName);

    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.uploadDocument(data);
      setStatus({ 
        loading: false, 
        error: null, 
        success: `${keyName.replace(/_/g, ' ').toUpperCase()} uploaded successfully.` 
      });
      fetchExistingDocuments();
    } catch (err) {
      // Handle 413 Payload Too Large and other server exceptions
      if (err.response?.status === 413) {
        setStatus({
          loading: false,
          error: "HTTP 413: The uploaded file is too large for the server. Please compress your document below 1 MB before re-uploading.",
          success: null
        });
      } else {
        setStatus({
          loading: false,
          error: err.response?.data?.message || 'File upload rejected by server. Please verify size and format.',
          success: null
        });
      }
    }
  };

  const handleCreateWildcard = () => {
    if (!newDocName.trim()) return;
    setWildcards(prev => [
      ...prev, 
      { name: newDocName.trim().toLowerCase().replace(/\s+/g, '_'), status: 'Pending', label: newDocName }
    ]);
    setNewDocName('');
  };

  return (
    <div className="max-w-5xl mx-auto my-8 space-y-6 px-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Verification Credentials Upload</h1>
        <p className="text-sm text-slate-500 mt-1">Upload verified identity & qualification certificates for hospital compliance audit.</p>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} onClose={() => setStatus({ loading: false, error: null, success: null })} />
      {status.loading && <Loader />}

      {/* Visual Upload Guidelines Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Document Photo Guidelines</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            Strict Limit: Max 1 MB per file
          </span>
        </div>

        {/* Visual Do & Don't Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* 1. Correct Example */}
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3 flex flex-col items-center text-center space-y-2.5">
            <div className="w-full h-32 bg-white rounded-lg border-2 border-emerald-500 relative flex flex-col justify-center items-center shadow-xs p-3">
              <div className="w-10 h-3 bg-emerald-100 rounded mb-1"></div>
              <div className="w-16 h-2 bg-slate-200 rounded mb-1"></div>
              <div className="w-12 h-2 bg-slate-200 rounded"></div>
              <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white rounded-full p-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800">Clear & Well-Cropped</p>
              <p className="text-[11px] text-emerald-700 leading-tight mt-0.5">All 4 corners visible, clear lighting, readable text.</p>
            </div>
          </div>

          {/* 2. Bad Example: Cut off */}
          <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-3 flex flex-col items-center text-center space-y-2.5">
            <div className="w-full h-32 bg-white rounded-lg border-2 border-rose-400 relative overflow-hidden flex items-center justify-center p-3">
              <div className="w-20 h-16 bg-slate-100 border border-slate-300 rounded translate-x-4 translate-y-3 opacity-60 flex flex-col justify-center items-center">
                <div className="w-10 h-2 bg-slate-300 rounded mb-1"></div>
                <div className="w-6 h-2 bg-slate-300 rounded"></div>
              </div>
              <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-0.5">
                <XCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800">Cut Off / Incomplete</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Do not cut edges, corners, or license numbers.</p>
            </div>
          </div>

          {/* 3. Bad Example: Dark/Shadowy */}
          <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-3 flex flex-col items-center text-center space-y-2.5">
            <div className="w-full h-32 bg-slate-900 rounded-lg border-2 border-rose-400 relative flex flex-col justify-center items-center p-3">
              <div className="w-10 h-3 bg-slate-700 rounded mb-1"></div>
              <div className="w-16 h-2 bg-slate-700 rounded mb-1"></div>
              <div className="w-12 h-2 bg-slate-700 rounded"></div>
              <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-0.5">
                <XCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800">Too Dark / Uneven</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Avoid dark backgrounds and harsh shadows.</p>
            </div>
          </div>

          {/* 4. Bad Example: Glare/Overexposed */}
          <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-3 flex flex-col items-center text-center space-y-2.5">
            <div className="w-full h-32 bg-gradient-to-tr from-amber-100 via-white to-white rounded-lg border-2 border-rose-400 relative flex flex-col justify-center items-center p-3">
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="text-xs text-amber-600 font-bold">⚡ Flash Glare</span>
              </div>
              <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white rounded-full p-0.5">
                <XCircle className="w-3.5 h-3.5" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800">Blurry or Flash Glare</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">Letters must be legible without reflection.</p>
            </div>
          </div>
        </div>

        {/* Bullet Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
            <p><strong>Size Limit:</strong> File must be under <strong>1 MB</strong>. Compress if needed before upload.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
            <p><strong>Supported Formats:</strong> JPG, JPEG, PNG image or PDF document.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
            <p><strong>Clarity Check:</strong> Ensure ID number and registration dates are sharply in focus.</p>
          </div>
        </div>
      </div>

      {/* Upload Rows Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Required Compliance Documents</h3>
          <span className="text-xs text-slate-400 font-medium">Automatic verification after upload</span>
        </div>

        <div className="divide-y divide-slate-100">
          {Object.keys(documents).map((key) => {
            const doc = documents[key];
            const isUploaded = doc.status === 'Uploaded';

            return (
              <div key={key} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl ${isUploaded ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold capitalize text-slate-800">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isUploaded ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className="text-xs text-slate-500 font-medium">{doc.status}</span>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold ml-2">
                          View Current File ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl cursor-pointer transition shadow-2xs self-start sm:self-auto">
                  <Upload className="w-3.5 h-3.5" /> {isUploaded ? 'Re-upload (< 1 MB)' : 'Upload (< 1 MB)'}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        validateAndUpload(key, e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            );
          })}

          {/* Dynamic Supplementary Documents */}
          {wildcards.map((doc, idx) => {
            const isUploaded = doc.status === 'Uploaded';
            return (
              <div key={idx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40 hover:bg-slate-50 transition">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl ${isUploaded ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">
                      {doc.label || doc.name.replace(/_/g, ' ')}
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${isUploaded ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className="text-xs text-slate-500 font-medium">{doc.status}</span>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-semibold ml-2">
                          View File ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition self-start sm:self-auto">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        validateAndUpload(doc.name, e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supplementary Document Generator */}
      <div className="p-5 border border-dashed border-slate-300 rounded-2xl bg-slate-50/60">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Add Supplementary Certification</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="e.g., Fellowship Certificate, State Council NOC"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleCreateWildcard}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
          >
            Add Document Row
          </button>
        </div>
      </div>
    </div>
  );
}