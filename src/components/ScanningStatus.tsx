import React from 'react';

interface ScanningStatusProps {
    type: 'quick' | 'full';
}

export const ScanningStatus: React.FC<ScanningStatusProps> = ({ type }) => {
    return (
        <div className="mt-2 mb-4 flex items-center space-x-2 bg-[#2a2a2a] rounded-lg p-2">
            <div className="w-1.5 h-1.5 bg-[#f47521] rounded-full animate-pulse" />
            <span className="text-xs text-white">
                {type === 'quick' ? 'Quick scanning...' : 'Full scanning...'}
            </span>
        </div>
    );
};