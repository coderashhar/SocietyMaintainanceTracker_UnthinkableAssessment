'use client';
import { useTheme } from '@/context/ThemeContext';

export default function SplashScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      id="splash-screen"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark ? '#000000' : '#ffffff',
        zIndex: 9999,
        gap: '20px',
        transition: 'background 0.2s',
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: isDark ? '#6366F1' : '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: '700',
          color: '#fff',
          letterSpacing: '-0.02em',
          fontFamily: "'Inter', system-ui, sans-serif",
          animation: 'splash-pulse 1.6s ease-in-out infinite',
        }}
      >
        S
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: isDark ? '#F0F0F0' : '#0F172A',
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '-0.01em',
          }}
        >
          Society Maintenance Tracker
        </div>
        <div
          style={{
            fontSize: '13px',
            color: isDark ? '#555555' : '#94A3B8',
            marginTop: '4px',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Loading…
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '120px',
          height: '2px',
          background: isDark ? '#1A1A1A' : '#E2E8F0',
          borderRadius: '2px',
          overflow: 'hidden',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            height: '100%',
            background: isDark ? '#6366F1' : '#2563EB',
            borderRadius: '2px',
            animation: 'splash-bar 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(0.95); }
        }
        @keyframes splash-bar {
          0%   { width: 0%;   margin-left: 0%; }
          50%  { width: 60%;  margin-left: 20%; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
