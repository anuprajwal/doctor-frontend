import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import { 
  FileText, 
  Upload, 
  Crop, 
  HardDrive, 
  Check, 
  X, 
  XCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState({
    aadharcard: { status: 'Pending', url: '', fileName: '' },
    license: { status: 'Pending', url: '', fileName: '' },
    mbbs_certificate: { status: 'Pending', url: '', fileName: '' }
  });
  const [wildcards, setWildcards] = useState([]);
  const [newDocName, setNewDocName] = useState('');
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  
  // Controls the Instructions Modal - open on page entry
  const [showInstructionsModal, setShowInstructionsModal] = useState(true);

  // Pre-upload confirmation checks
  const [checklist, setChecklist] = useState({
    correctDoc: false,
    entireVisible: false
  });

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

    // Strict 1 MB size limit check (1024 * 1024 bytes)
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
      {/* Header & Re-open Instructions Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Verification Credentials Upload</h1>
          <p className="text-sm text-slate-500 mt-1">Upload verified identity & qualification certificates for hospital compliance audit.</p>
        </div>

        <button
          onClick={() => setShowInstructionsModal(true)}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-100 self-start sm:self-auto"
        >
          <HelpCircle className="w-4 h-4 text-blue-600" /> View Upload Instructions
        </button>
      </div>

      <Alert 
        type={status.success ? 'success' : 'error'} 
        message={status.success || status.error} 
        onClose={() => setStatus({ loading: false, error: null, success: null })} 
      />
      {status.loading && <Loader />}

      {/* REQUIRED COMPLIANCE DOCUMENTS SECTION */}
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

      {/* STRUCTURED INSTRUCTIONS MODAL */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 relative my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Document Upload Guidelines</h2>
                  <p className="text-xs text-slate-500">Ensure your document photo meets all verification requirements.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInstructionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Top Grid: Key Requirements & Readability / Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Key Requirements */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Key Requirements</h3>

                <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                    <Crop className="w-4 h-4" />
                    <span>Crop correctly</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Keep the entire document inside the frame — all 4 corners must be visible.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                    <HardDrive className="w-4 h-4" />
                    <span className="flex items-center gap-1.5">
                      Maximum <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded text-[10px] font-bold">1 MB</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Each document image must be smaller than 1 MB.
                  </p>
                </div>
              </div>

              {/* Right Column: Make sure the text is readable & Pre-upload checklist */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Make sure the text is readable</h3>
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>Sharp letters</span>
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>Blurry images</span>
                      <X className="w-4 h-4 text-rose-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-2">Before you tap Upload</h4>
                  <div className="space-y-2 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklist.correctDoc}
                        onChange={(e) => setChecklist(prev => ({ ...prev, correctDoc: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span>Correct document</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={checklist.entireVisible}
                        onChange={(e) => setChecklist(prev => ({ ...prev, entireVisible: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span>Entire document visible</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: Lighting Verification Guide */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Lighting Guide</h3>

              <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col items-center">
                
                {/* Header Tag */}
                <div className="bg-white border border-slate-200 px-4 py-1 rounded shadow-xs mb-4">
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    LIGHTING VERIFICATION GUIDE
                  </span>
                </div>

                {/* 3 Real Photographic Visual Comparisons */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-lg mb-4">
                  {/* 1. GOOD */}
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-3/4 rounded-lg bg-white border border-slate-300 overflow-hidden shadow-xs relative">
                      <div className="p-1.5 sm:p-2.5 h-full flex flex-col justify-between bg-slate-50">
                        <div>
                          <div className="text-[7px] sm:text-[9px] font-bold text-slate-500">PASSPORT / ID</div>
                          <div className="w-full h-1 bg-slate-300 rounded my-1"></div>
                        </div>
                        <div className="w-8 sm:w-12 h-10 sm:h-14 bg-blue-100 rounded mx-auto flex items-center justify-center text-blue-700 text-[9px] font-bold">
                          PHOTO
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 bg-slate-300 rounded"></div>
                          <div className="w-3/4 h-1 bg-slate-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <span className="mt-2 bg-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
                      1. GOOD
                    </span>
                  </div>

                  {/* 2. TOO DARK */}
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-3/4 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shadow-xs relative">
                      <div className="p-1.5 sm:p-2.5 h-full flex flex-col justify-between bg-slate-950 opacity-50">
                        <div>
                          <div className="text-[7px] sm:text-[9px] font-bold text-slate-600">PASSPORT / ID</div>
                          <div className="w-full h-1 bg-slate-700 rounded my-1"></div>
                        </div>
                        <div className="w-8 sm:w-12 h-10 sm:h-14 bg-slate-800 rounded mx-auto flex items-center justify-center text-slate-600 text-[9px] font-bold">
                          DARK
                        </div>
                        <div className="space-y-0.5">
                          <div className="w-full h-1 bg-slate-700 rounded"></div>
                          <div className="w-3/4 h-1 bg-slate-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <span className="mt-2 bg-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
                      2. TOO DARK
                    </span>
                  </div>

                  {/* 3. GLARE */}
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-3/4 rounded-lg bg-white border border-slate-300 overflow-hidden shadow-xs relative">
                      <div className="p-1.5 sm:p-2.5 h-full flex flex-col justify-between bg-slate-50 relative">
                        <div className="absolute inset-0 bg-radial from-white via-white/80 to-transparent flex items-center justify-center">
                          <span className="text-[9px] font-black text-amber-500 uppercase">⚡ GLARE</span>
                        </div>
                        <div>
                          <div className="text-[7px] sm:text-[9px] font-bold text-slate-300">PASSPORT / ID</div>
                        </div>
                        <div className="w-8 sm:w-12 h-10 sm:h-14 bg-slate-100 rounded mx-auto"></div>
                        <div className="w-full h-1 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                    <span className="mt-2 bg-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs">
                      3. GLARE
                    </span>
                  </div>
                </div>

                {/* Subtext description */}
                <p className="text-[11px] sm:text-xs text-slate-600 text-center leading-relaxed max-w-md">
                  Use enough light to clearly see every letter, but avoid excessive brightness or reflections.
                </p>
              </div>
            </div>

            {/* Modal Bottom Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg"
              >
                I Understand, Continue to Upload
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}