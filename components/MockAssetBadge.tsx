import React from 'react';
import { ShieldAlert, TestTube } from 'lucide-react';

interface MockAssetBadgeProps {
    isMock: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const MockAssetBadge: React.FC<MockAssetBadgeProps> = ({ isMock, className = '', size = 'md' }) => {
    if (!isMock) return null;

    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-2'
    };

    return (
        <div className={`
      inline-flex items-center gap-1.5 
      bg-amber-100 text-amber-700 
      border border-amber-200 
      dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 
      font-bold rounded-full uppercase tracking-wider
      ${sizeClasses[size]}
      ${className}
    `}>
            <TestTube className={size === 'sm' ? "w-3 h-3" : "w-4 h-4"} />
            <span>Mock / Testnet Asset</span>
        </div>
    );
};
