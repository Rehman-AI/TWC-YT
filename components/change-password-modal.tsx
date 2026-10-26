"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { changeMyPassword } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { X, KeyRound, CheckCircle2 } from "lucide-react";

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [state, formAction] = useFormState(changeMyPassword, null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setIsSuccess(true);
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Change Password</h2>
              <p className="text-[11px] text-zinc-500">Update your account login password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
              <div className="text-sm font-semibold text-zinc-900">Password Updated!</div>
              <p className="text-xs text-zinc-500">Your new password is now active.</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                  {state.error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-zinc-50/50 border border-zinc-200 rounded-lg text-zinc-900 text-sm focus:bg-white focus:border-pink-500/50 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  Cancel
                </button>
                <SubmitButton pendingText="Saving...">Update Password</SubmitButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
