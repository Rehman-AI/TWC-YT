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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#111114] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#16161d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Change Password</h2>
              <p className="text-[11px] text-zinc-400">Update your account login password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <div className="text-sm font-semibold text-white">Password Updated!</div>
              <p className="text-xs text-zinc-400">Your new password is now active.</p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4">
              {state?.error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {state.error}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Current Password
                </label>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#1a1a1f] border border-white/[0.06] rounded-lg text-white text-sm focus:border-pink-500/50 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
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
