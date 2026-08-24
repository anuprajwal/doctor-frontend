import React from 'react';
import InputField from '../ui/InputField';

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function OtpVerificationField({
  type,
  label,
  name,
  value,
  isVerified,
  otpData,
  maxAttempts,
  onSendOtp,
  onVerifyOtp,
  onOtpChange,
  placeholder,
  helperText
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <InputField label={label} name={name} value={value} readOnly />
        </div>
        {isVerified ? (
          <div className="h-10 flex items-center px-2 text-green-600">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
        ) : (
          <button
            type="button"
            disabled={otpData.loading || otpData.resendTimer > 0}
            onClick={() => onSendOtp(type)}
            className="h-10 px-3 bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 text-xs font-bold rounded-lg border border-slate-200 transition"
          >
            {otpData.loading ? 'Sending...' : otpData.sent ? 'Resend' : 'Verify'}
          </button>
        )}
      </div>

      {otpData.sent && !isVerified && (
        <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder={placeholder}
              className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white"
              value={otpData.otp}
              disabled={otpData.attempts >= maxAttempts}
              onChange={e => onOtpChange(type, e.target.value.replace(/\D/g, ''))}
            />
            <button
              type="button"
              disabled={otpData.loading || otpData.attempts >= maxAttempts}
              onClick={() => onVerifyOtp(type)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
            >
              {otpData.loading ? 'Verifying...' : 'Confirm'}
            </button>
          </div>

          <div className="flex justify-between items-center text-[11px] pt-1">
            <div>
              {otpData.error ? (
                <span className="text-red-500 font-medium">{otpData.error}</span>
              ) : (
                <span className="text-slate-500">{helperText}</span>
              )}
            </div>

            <div>
              {otpData.resendTimer > 0 ? (
                <span className="text-slate-400 font-medium">Resend in {otpData.resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSendOtp(type)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}