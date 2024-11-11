import React from 'react';
import { Calendar, FileText } from 'lucide-react';
import { Patient } from '../types';

interface RecordCardProps {
  patient: Patient;
}

export function RecordCard({ patient }: RecordCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 transition-all hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gray-100 p-2 rounded-xl">
            <FileText className="h-5 w-5 text-apple-black" />
          </div>
          <h3 className="text-lg font-semibold text-apple-black">{patient.name}</h3>
        </div>
        <div className="flex items-center text-sm text-apple-gray">
          <Calendar className="h-4 w-4 mr-1" />
          {patient.recordDate}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-6">
          <pre className="text-apple-black whitespace-pre-wrap font-sans">{patient.content}</pre>
        </div>
      </div>
    </div>
  );
}