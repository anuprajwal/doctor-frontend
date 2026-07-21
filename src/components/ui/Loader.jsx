import React from 'react';

export default function Loader({ size = 'md' }) {
  const dims = size === 'sm' ? 'h-4 w-4' : 'h-8 w-8';
  return (
    <div class="flex justify-center items-center py-4">
      <div className={`${dims} animate-spin rounded-full border-2 border-slate-200 border-t-blue-600`}></div>
    </div>
  );
}