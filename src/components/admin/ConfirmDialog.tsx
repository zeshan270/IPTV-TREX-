"use client";

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { HiExclamation } from "react-icons/hi";
import clsx from "clsx";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const btnColors = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <div
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                variant === "danger" && "bg-red-500/20 text-red-400",
                variant === "warning" && "bg-yellow-500/20 text-yellow-400",
                variant === "info" && "bg-blue-500/20 text-blue-400"
              )}
            >
              <HiExclamation className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">
                {title}
              </DialogTitle>
              <p className="mt-2 text-sm text-gray-400">{message}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={clsx(
                "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50",
                btnColors[variant]
              )}
            >
              {loading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
