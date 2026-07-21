import React from 'react';

export default function InputField({ label, name, type = 'text', value, onChange, disabled, placeholder, readOnly, error }) {
  return (
    <div class="mb-4 w-full">
      <label class="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || readOnly}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-all outline-none
          ${readOnly || disabled ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}`}
      />
      {error && <p class="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}