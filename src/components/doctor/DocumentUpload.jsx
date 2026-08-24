import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/api';
import Alert from '../ui/Alert';
import Loader from '../ui/Loader';
import InputField from '../ui/InputField';

export default function DocumentUpload() {
  const [documents, setDocuments] = useState({
    aadharcard: { status: 'Pending', url: '' },
    license: { status: 'Pending', url: '' },
    mbbs_certificate: { status: 'Pending', url: '' }
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
      // Expecting array mapping inside return signature payload
      if (res.data) {
        // Map elements directly matching keys into structured map configuration
        const updated = { ...documents };
        const dynamicDocs = [];
        res.data.forEach(d => {
          if (updated[d.key]) {
            updated[d.key] = { status: 'Uploaded', url: d.url };
          } else {
            dynamicDocs.push({ name: d.key, status: 'Uploaded', url: d.url });
          }
        });
        setDocuments(updated);
        setWildcards(dynamicDocs);
      }
    } catch (err) {
      console.error("Failed fetching standard profile documents mapping ecosystem context.");
    }
  };

  const executeUpload = async (keyName, file) => {
    if (!file) return;
    const data = new FormData();
    data.append('document', file);
    data.append('documentName', keyName);

    setStatus({ loading: true, error: null, success: null });
    try {
      await doctorService.uploadDocument(data);
      setStatus({ loading: false, error: null, success: `${keyName.toUpperCase()} updated successfully.` });
      fetchExistingDocuments();
    } catch (err) {
      setStatus({ loading: false, error: err.response?.data?.message || 'File system processing exception triggered.', success: null });
    }
  };

  const handleCreateWildcard = () => {
    if (!newDocName.trim()) return;
    setWildcards(prev => [...prev, { name: newDocName.trim().toLowerCase().replace(/\s+/g, '_'), status: 'Pending', label: newDocName }]);
    setNewDocName('');
  };

  return (
    <div class="max-w-4xl mx-auto my-10 bg-white border border-slate-100 shadow-sm rounded-xl p-8">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-800">Verification Credentials Verification</h2>
        <p class="text-xs text-slate-500">Upload your verified identification matching regulatory hospital configurations.</p>
      </div>

      <Alert type={status.success ? 'success' : 'error'} message={status.success || status.error} />
      {status.loading && <Loader />}

      <div class="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
        {/* Core Structural Rows */}
        {Object.keys(documents).map((key) => (
          <div key={key} class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span class="text-sm font-semibold capitalize text-slate-700">{key.replace('_', ' ')}</span>
              <div class="mt-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${documents[key].status === 'Uploaded' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span class="text-xs text-slate-500 font-medium">{documents[key].status}</span>
              </div>
            </div>
            <label class="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition">
              Upload File
              <input type="file" class="hidden" onChange={(e) => executeUpload(key, e.target.files[0])} />
            </label>
          </div>
        ))}

        {/* Dynamic Wildcard Rows */}
        {wildcards.map((doc, idx) => (
          <div key={idx} class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <span class="text-sm font-semibold text-slate-700">{doc.label || doc.name.replace('_', ' ')}</span>
              <div class="mt-1 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${doc.status === 'Uploaded' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span class="text-xs text-slate-500 font-medium">{doc.status}</span>
              </div>
            </div>
            <label class="px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition">
              Upload File
              <input type="file" class="hidden" onChange={(e) => executeUpload(doc.name, e.target.files[0])} />
            </label>
          </div>
        ))}
      </div>

      {/* Wildcard Section Generator */}
      <div class="mt-8 p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <h4 class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Add Custom Supplementary Document</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <input 
              type="text" 
              value={newDocName} 
              onChange={(e) => setNewDocName(e.target.value)} 
              placeholder="e.g., Fellowship Certificate" 
              class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none bg-white focus:border-blue-500"
            />
          </div>
          <button type="button" onClick={handleCreateWildcard} class="px-4 py-2 bg-slate-800 text-white font-medium text-xs rounded-lg hover:bg-slate-900 transition">
            Initialize Row
          </button>
        </div>
      </div>
    </div>
  );
}