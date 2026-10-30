import React from 'react';

interface ItemArtworkProps {
  itemId: string;
  className?: string;
}

export const ItemArtwork: React.FC<ItemArtworkProps> = ({
  itemId,
  className = 'w-8 h-8',
}) => {
  switch (itemId) {
    case 'whistle':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path
            d="M8 22h20a10 10 0 1 1-8.5 15.2L15 30H8v-8Z"
            fill="#F97316"
            stroke="#9A3412"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="29" cy="27" r="4" fill="#FED7AA" stroke="#9A3412" strokeWidth="2" />
          <circle cx="41" cy="27" r="3" stroke="#9A3412" strokeWidth="2" />
          <path d="M18 16l3-5M24 15l1-5M13 18l-4-4" stroke="#EA580C" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'wax-matches':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="6" y="33" width="36" height="7" rx="2" fill="#78350F" />
          <line x1="14" y1="30" x2="14" y2="14" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="14" cy="12" rx="3.5" ry="5" fill="#DC2626" />
          <ellipse cx="14" cy="14" rx="4.5" ry="5.5" fill="#FEF3C7" fillOpacity="0.65" stroke="#F59E0B" strokeWidth="1.2" />
          <line x1="24" y1="30" x2="24" y2="12" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="24" cy="10" rx="3.5" ry="5" fill="#DC2626" />
          <ellipse cx="24" cy="12" rx="4.5" ry="5.5" fill="#FEF3C7" fillOpacity="0.65" stroke="#F59E0B" strokeWidth="1.2" />
          <line x1="34" y1="30" x2="34" y2="15" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="34" cy="13" rx="3.5" ry="5" fill="#DC2626" />
          <ellipse cx="34" cy="15" rx="4.5" ry="5.5" fill="#FEF3C7" fillOpacity="0.65" stroke="#F59E0B" strokeWidth="1.2" />
        </svg>
      );

    case 'ferro-rod':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="7" y="25" width="12" height="9" rx="3" transform="rotate(-30 7 25)" fill="#EA580C" stroke="#7C2D12" strokeWidth="2" />
          <rect x="17" y="21" width="22" height="5" rx="2" transform="rotate(-30 17 21)" fill="#334155" stroke="#0F172A" strokeWidth="1.8" />
          <path d="M36 14l6-4M38 19l7 1M33 10l2-6" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'mini-candle':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path d="M24 7c3.5 4.5 5 7.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-5.5 5-10Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          <line x1="24" y1="19" x2="24" y2="23" stroke="#1E293B" strokeWidth="2" />
          <rect x="14" y="23" width="20" height="16" rx="3" fill="#FEF3C7" stroke="#B45309" strokeWidth="2.2" />
          <rect x="12" y="35" width="24" height="6" rx="2" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
        </svg>
      );

    case 'mini-led':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="20" cy="26" r="11" fill="#1E293B" stroke="#0F172A" strokeWidth="2.2" />
          <circle cx="20" cy="26" r="4.5" fill="#38BDF8" />
          <path d="M29 22l12-7v22l-12-7v-8Z" fill="#FEF08A" fillOpacity="0.8" />
          <circle cx="11" cy="26" r="2.2" fill="#94A3B8" />
        </svg>
      );

    case 'button-compass':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="24" cy="24" r="17" fill="#ECFDF5" stroke="#065F46" strokeWidth="2.8" />
          <circle cx="24" cy="24" r="13" stroke="#A7F3D0" strokeWidth="1.5" />
          <polygon points="24,11 28,24 24,22 20,24" fill="#EF4444" />
          <polygon points="24,37 28,24 24,26 20,24" fill="#334155" />
          <circle cx="24" cy="24" r="2.5" fill="#FBBF24" />
        </svg>
      );

    case 'romer-card':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="8" y="8" width="32" height="32" rx="4" fill="#E0F2FE" fillOpacity="0.85" stroke="#0284C7" strokeWidth="2.4" />
          <path d="M14 14h18v18" stroke="#0369A1" strokeWidth="2" />
          <path d="M18 14v3M22 14v3M26 14v3M30 14v3M32 18h-3M32 22h-3M32 26h-3M32 30h-3" stroke="#0369A1" strokeWidth="1.6" />
          <text x="12" y="36" fontSize="7.5" fontWeight="bold" fill="#0369A1">1:25k</text>
        </svg>
      );

    case 'pencil-paper':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="8" y="10" width="24" height="28" rx="2" fill="#FFFBEB" stroke="#B45309" strokeWidth="2" />
          <line x1="13" y1="17" x2="27" y2="17" stroke="#D97706" strokeWidth="1.8" />
          <line x1="13" y1="23" x2="25" y2="23" stroke="#D97706" strokeWidth="1.8" />
          <line x1="13" y1="29" x2="22" y2="29" stroke="#D97706" strokeWidth="1.8" />
          <path d="M26 35l11-19 5 3-11 19-6 3 1-6Z" fill="#FBBF24" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      );

    case 'plasters':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="6" y="17" width="36" height="14" rx="7" fill="#FDBA74" stroke="#9A3412" strokeWidth="2.2" />
          <rect x="18" y="19" width="12" height="10" rx="2" fill="#FFF7ED" stroke="#C2410C" strokeWidth="1.6" />
          <circle cx="12" cy="22" r="1" fill="#9A3412" />
          <circle cx="12" cy="26" r="1" fill="#9A3412" />
          <circle cx="36" cy="22" r="1" fill="#9A3412" />
          <circle cx="36" cy="26" r="1" fill="#9A3412" />
        </svg>
      );

    case 'antiseptic-wipe':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="9" y="9" width="30" height="30" rx="4" fill="#F0FDF4" stroke="#15803D" strokeWidth="2.4" />
          <rect x="13" y="13" width="22" height="22" rx="2" stroke="#86EFAC" strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M24 17v14M17 24h14" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );

    case 'gauze-pad':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="9" y="12" width="30" height="24" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="2.2" />
          <path d="M15 12v24M21 12v24M27 12v24M33 12v24M9 18h30M9 24h30M9 30h30" stroke="#CBD5E1" strokeWidth="1.4" />
          <path d="M24 19v10M19 24h10" stroke="#EF4444" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );

    case 'tweezers':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path d="M12 37L34 11c1.5-1.5 4 1 2.5 2.5L15 39" stroke="#475569" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="35.5" cy="12.5" r="2" fill="#94A3B8" />
        </svg>
      );

    case 'mini-scissors':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="15" cy="33" r="5.5" stroke="#2563EB" strokeWidth="2.8" fill="#DBEAFE" />
          <circle cx="27" cy="35" r="5.5" stroke="#2563EB" strokeWidth="2.8" fill="#DBEAFE" />
          <path d="M19 29L35 11M23 31L15 11" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <circle cx="23" cy="23" r="2" fill="#1E293B" />
        </svg>
      );

    case 'safety-pins':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <path
            d="M14 33a5 5 0 1 1 5 5l16-20c2-2.5-1.5-6-4-3.5L14 33Z"
            stroke="#475569"
            strokeWidth="2.6"
            fill="none"
          />
          <circle cx="33" cy="14" r="4" fill="#94A3B8" stroke="#334155" strokeWidth="2" />
        </svg>
      );

    case 'needle-thread':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="13" y="12" width="16" height="24" rx="2" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
          <rect x="11" y="10" width="20" height="4" rx="1.5" fill="#D97706" />
          <rect x="11" y="34" width="20" height="4" rx="1.5" fill="#D97706" />
          <line x1="35" y1="10" x2="39" y2="36" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M29 22c5-2 7-8 6-10" stroke="#FCA5A5" strokeWidth="1.8" fill="none" />
        </svg>
      );

    case 'water-tabs':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="9" y="11" width="30" height="26" rx="4" fill="#E0F2FE" stroke="#0369A1" strokeWidth="2.2" />
          <circle cx="18" cy="19" r="3.8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.8" />
          <circle cx="30" cy="19" r="3.8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.8" />
          <circle cx="18" cy="29" r="3.8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.8" />
          <circle cx="30" cy="29" r="3.8" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.8" />
        </svg>
      );

    case 'electrolyte-salt':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="10" y="9" width="28" height="30" rx="3" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="2.2" />
          <path d="M25 15l-5 9h5l-2 9 7-10h-5l2-8Z" fill="#EAB308" stroke="#A16207" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );

    case 'heavy-foil':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <polygon points="10,14 34,10 38,34 14,38" fill="#E2E8F0" stroke="#475569" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M15 18l16-3M17 25l14-2M18 32l10-2" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'fishing-kit':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="18" cy="18" r="8" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="4 2" />
          <path d="M26 18v13a6 6 0 0 0 12 0v-5l-4 3" stroke="#334155" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="26" cy="16" r="2" fill="#334155" />
        </svg>
      );

    case 'emergency-coins':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="7" y="13" width="24" height="16" rx="2.5" fill="#A7F3D0" stroke="#047857" strokeWidth="2" />
          <circle cx="32" cy="29" r="9" fill="#FDE047" stroke="#A16207" strokeWidth="2.2" />
          <text x="29" y="32.5" fontSize="9" fontWeight="bold" fill="#854D0E">$</text>
        </svg>
      );

    // TRAP ITEMS
    case 'trap-big-scissors':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <circle cx="13" cy="34" r="6" stroke="#DC2626" strokeWidth="3" fill="#FEE2E2" />
          <circle cx="26" cy="36" r="6" stroke="#DC2626" strokeWidth="3" fill="#FEE2E2" />
          <path d="M17 29L41 7M23 31L13 7" stroke="#64748B" strokeWidth="3.8" strokeLinecap="round" />
        </svg>
      );

    case 'trap-chocolate':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="9" y="10" width="30" height="28" rx="3" fill="#78350F" stroke="#451A03" strokeWidth="2.2" />
          <path d="M9 24h30M24 10v14" stroke="#451A03" strokeWidth="2" />
          <path d="M9 26h30v10a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V26Z" fill="#EF4444" />
          <path d="M15 38c0 3 3 4 3 0M28 38c0 4 4 4 4 0" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'trap-red-potion':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="19" y="8" width="10" height="6" rx="1.5" fill="#1E293B" />
          <rect x="14" y="14" width="20" height="26" rx="4" fill="#FCA5A5" stroke="#991B1B" strokeWidth="2.2" />
          <rect x="16" y="23" width="16" height="15" rx="2" fill="#DC2626" />
          <path d="M20 27l8 8M28 27l-8 8" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'trap-lighter':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="15" y="16" width="18" height="25" rx="3" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2.2" />
          <rect x="16" y="10" width="10" height="6" rx="1.5" fill="#94A3B8" stroke="#334155" strokeWidth="2" />
          <circle cx="29" cy="13" r="3" fill="#475569" />
        </svg>
      );

    case 'trap-paper-matches':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="11" y="14" width="26" height="22" rx="2" fill="#E5E7EB" stroke="#6B7280" strokeWidth="2.2" />
          <path d="M18 10c0 3-3 5-3 7a3 3 0 0 0 6 0c0-2-3-4-3-7Z" fill="#60A5FA" />
          <line x1="20" y1="22" x2="28" y2="28" stroke="#EF4444" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="28" y1="22" x2="20" y2="28" stroke="#EF4444" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );

    case 'trap-powerbank':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="8" y="8" width="32" height="32" rx="5" fill="#334155" stroke="#0F172A" strokeWidth="2.5" />
          <path d="M25 15l-5 9h5l-2 9 7-10h-5l2-8Z" fill="#38BDF8" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect x="10" y="10" width="28" height="28" rx="6" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        </svg>
      );
  }
};
