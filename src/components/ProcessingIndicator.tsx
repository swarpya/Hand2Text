import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingIndicatorProps {
  message: string;
}

export function ProcessingIndicator({ message }: ProcessingIndicatorProps) {
  return (
    <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-apple-black bg-gray-50 p-4 rounded-xl">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="font-medium">{message}</span>
    </div>
  );
}