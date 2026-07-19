import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  textClassName?: string;
  hideText?: boolean;
}

export function Logo({ className = '', width = 180, height = 32, textClassName = 'text-brand-navy', hideText = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg 
        width={hideText ? width : height * 1.25} 
        height={height} 
        viewBox="0 0 50 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path d="M15 4L5 36H15L25 4H15Z" fill="#1ECE25"/>
        <path d="M30 4L20 36H30L40 4H30Z" fill="#1ECE25"/>
      </svg>
      
      {!hideText && (
        <div className={`font-black tracking-tight leading-none flex items-start ${textClassName}`} style={{ fontSize: height * 0.85 }}>
          <span>SharpWork</span>
          <span className="text-[#1ECE25] font-bold tracking-tighter" style={{ fontSize: height * 0.3, marginTop: height * 0.05, marginLeft: 2 }}>
            TM
          </span>
        </div>
      )}
    </div>
  );
}
