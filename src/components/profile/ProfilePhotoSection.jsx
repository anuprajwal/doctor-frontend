import React from 'react';

export default function ProfilePhotoSection({ profilePicture, onPhotoUpload, onPhotoDelete }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
      <div className="relative w-24 h-24 rounded-full border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
        {profilePicture ? (
          <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl">🩺</span>
        )}
      </div>
      <div className="flex gap-2">
        <label className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-blue-700 transition">
          Upload Photo
          <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
        </label>
        {profilePicture && (
          <button 
            type="button" 
            onClick={onPhotoDelete} 
            className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 transition"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}