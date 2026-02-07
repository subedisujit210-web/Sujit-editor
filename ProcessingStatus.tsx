
import React from 'react';

interface ProcessingStatusProps {
  steps: { id: string; label: string; isComplete: boolean }[];
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ steps }) => {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 mt-8 animate-fade-in">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        AI is Retouching Your Photo
      </h3>
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step.isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step.isComplete ? '✓' : index + 1}
            </div>
            <span className={`text-sm transition-colors ${step.isComplete ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-500" 
          style={{ width: `${(steps.filter(s => s.isComplete).length / steps.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProcessingStatus;
