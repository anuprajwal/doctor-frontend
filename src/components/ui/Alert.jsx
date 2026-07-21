import React from 'react';

export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div className={`p-4 rounded-lg flex items-start justify-between border mb-4 text-sm ${
      isSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
    }`}>
      <div class="flex gap-2">
        <span class="font-bold">{isSuccess ? '✓' : '⚠'}</span>
        <span>{message}</span>
      </div>
      {onClose && <button onClick={onClose} class="text-xs opacity-60 hover:opacity-100 font-semibold ml-4">✕</button>}
    </div>
  );
}