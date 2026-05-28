"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName: string;
  confirmText: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  confirmText,
}: DeleteConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isPending, setIsPending] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (inputValue !== confirmText) return;
    setIsPending(true);
    await onConfirm();
    setIsPending(false);
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-center text-gray-500 mb-4">
          Are you sure you want to delete{" "}
          <span className="font-bold text-gray-700">&quot;{itemName}&quot;</span>? This
          action cannot be undone.
        </p>
        
        <div className="mb-6">
          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">
            Type <span className="text-red-600">&quot;{confirmText}&quot;</span> to confirm
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmText}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || inputValue !== confirmText}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
