'use client';

import { useEffect } from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  retryText: string;
  onRetry?: () => void;
}

export default function ErrorModal({
  isOpen,
  onClose,
  title,
  message,
  retryText,
  onRetry,
}: ErrorModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onRetry || onClose}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            {retryText}
          </button>
        </div>
      </div>
    </div>
  );
}
