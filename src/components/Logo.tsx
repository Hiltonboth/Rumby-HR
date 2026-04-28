import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Logo = ({ className = "w-10 h-10", dark = false }: { className?: string, dark?: boolean }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(className, "cursor-pointer transition-transform duration-300 hover:scale-110")}
    >
      <defs>
        <linearGradient id="wise-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00B9FF" />
          <stop offset="100%" stopColor="#3751FF" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Precision Geometric 'Z' - Wise/Modern Aesthetic */}
      <motion.path 
        d="M25 30H75L45 55H70L60 75H20L50 50H25L25 30Z" 
        fill="url(#wise-grad)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      
      {/* Precision highlight */}
      <circle cx="75" cy="30" r="4" fill="white" className="mix-blend-overlay opacity-50" />
    </svg>
  );
};

export const Favicon = () => {
  return (
    <Logo className="w-16 h-16" />
  );
};
