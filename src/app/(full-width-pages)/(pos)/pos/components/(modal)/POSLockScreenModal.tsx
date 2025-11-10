"use client";
import React, { useState, useRef, useEffect } from "react";

interface POSLockScreenProps {
  isLocked: boolean;
  onUnlock: (pin: string) => void;
  correctPin: string;
}

export default function POSLockScreen({
  isLocked,
  onUnlock,
  correctPin,
}: POSLockScreenProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isSystemLocked, setIsSystemLocked] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  const MAX_ATTEMPTS = 3;
  const LOCK_DURATION = 30000; // 30 seconds

  useEffect(() => {
    if (isLocked) {
      setPin("");
      setError("");
      setAttempts(0);
      setIsSystemLocked(false);
      // Auto-focus input when locked
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [isLocked]);

  const handlePinInput = (value: string) => {
    if (isSystemLocked) return;

    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");
    setPin(numericValue.slice(0, 6)); // Max 6 digits
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSystemLocked) {
      setError("กรุณารอสักครู่ก่อนพยายามอีกครั้ง");
      return;
    }

    if (pin.length !== correctPin.length) {
      setError(`กรุณาใส่รหัส ${correctPin.length} หลัก`);
      return;
    }

    if (pin === correctPin) {
      onUnlock(pin);
      setPin("");
      setError("");
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsSystemLocked(true);
        setError(`❌ พยายามผิดเกินไป! ระบบจะปลดล็อคในอีก 30 วินาที`);

        setTimeout(() => {
          setIsSystemLocked(false);
          setAttempts(0);
          setPin("");
          setError("");
          pinInputRef.current?.focus();
        }, LOCK_DURATION);
      } else {
        setError(`❌ รหัสผิด! เหลืออีก ${MAX_ATTEMPTS - newAttempts} ครั้ง`);
        setPin("");
      }
    }
  };

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        {/* Lock Icon */}

        {/* Main Content */}
        <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800/80 p-10 shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white"> POS OK Mobile</h1>
            <p className="mt-3 text-lg text-gray-400">
              เข้าสู่ระบบ POS ด้วยรหัสพนักงาน
            </p>
          </div>

          {/* PIN Input Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Field */}
            <div>
              <label className="mb-3 block text-center text-sm font-semibold text-gray-300">
                รหัส PIN ({correctPin.length} หลัก)
              </label>
              <input
                ref={pinInputRef}
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                placeholder="••••••"
                maxLength={correctPin.length}
                disabled={isSystemLocked}
                className={`w-full rounded-xl border-2 bg-gray-700/50 px-6 py-4 text-center text-4xl font-bold tracking-widest text-white placeholder-gray-500 transition-all focus:outline-none ${
                  error
                    ? "border-red-500 focus:border-red-600"
                    : "border-gray-600 focus:border-blue-500"
                } ${isSystemLocked ? "cursor-not-allowed opacity-50" : ""}`}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-center text-sm font-semibold text-red-400">
                {error}
              </div>
            )}

            {/* Attempts Display */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <div className="rounded-lg border border-yellow-800 bg-yellow-950/50 p-4 text-center text-sm text-yellow-400">
                ⚠️ พยายามผิด {attempts}/{MAX_ATTEMPTS} ครั้ง
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSystemLocked || pin.length !== correctPin.length}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-lg font-bold text-white transition-all hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sign in
            </button>
          </form>

          {/* Info */}
          <div className="mt-8 rounded-lg border border-blue-800 bg-blue-950/30 p-4 text-center text-sm text-blue-300">
            <p>💡 ระบบปลดล็อคเมื่อใส่รหัส PIN ที่ถูกต้อง</p>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">ระบบจะล็อคอัตโนมัติเพื่อความปลอดภัย</p>
        </div>
      </div>
    </div>
  );
}
