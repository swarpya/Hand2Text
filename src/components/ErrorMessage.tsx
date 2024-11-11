import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-red-600 bg-red-50 p-4 rounded-xl">
      <AlertCircle className="h-5 w-5" />
      <span className="font-medium">{message}</span>
    </div>
  );
}