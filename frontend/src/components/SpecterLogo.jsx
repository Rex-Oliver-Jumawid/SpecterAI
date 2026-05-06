import React from 'react';

export default function SpecterLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: size * 0.22, flexShrink: 0 }}>
      <defs>
        <linearGradient id="logobg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#020618"/>
          <stop offset="100%" stopColor="#0a0e1f"/>
        </linearGradient>
        <linearGradient id="logoring1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e40ff"/>
          <stop offset="50%" stopColor="#38bdf8"/>
          <stop offset="100%" stopColor="#0ea5e9"/>
        </linearGradient>
        <linearGradient id="logoring2" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        <linearGradient id="logostar" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#93c5fd"/>
          <stop offset="100%" stopColor="#3b82f6"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#logobg)"/>
      <ellipse cx="50" cy="50" rx="34" ry="20" fill="none" stroke="url(#logoring1)" strokeWidth="3" transform="rotate(-25,50,50)" opacity="0.6"/>
      <ellipse cx="50" cy="50" rx="28" ry="16" fill="none" stroke="url(#logoring2)" strokeWidth="3.5" transform="rotate(35,50,50)" opacity="0.8"/>
      <path d="M50 24 L54 43 L73 50 L54 57 L50 76 L46 57 L27 50 L46 43 Z" fill="url(#logostar)"/>
      <circle cx="73" cy="34" r="3.5" fill="#38bdf8" opacity="0.9"/>
      <circle cx="28" cy="64" r="2" fill="#2563eb" opacity="0.6"/>
    </svg>
  );
}
