// Custom SVG Icons

export const CheckmarkIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const MapPinIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="2" />
  </svg>
)

export const CalendarIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <path d="M3 9H21" stroke={color} strokeWidth="2" />
    <path d="M7 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M17 2V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="7" cy="13" r="1" fill={color} />
    <circle cx="12" cy="13" r="1" fill={color} />
    <circle cx="17" cy="13" r="1" fill={color} />
    <circle cx="7" cy="17" r="1" fill={color} />
    <circle cx="12" cy="17" r="1" fill={color} />
    <circle cx="17" cy="17" r="1" fill={color} />
  </svg>
)

export const WaveIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C4 12 6 10 8 10C10 10 12 12 14 12C16 12 18 10 20 10C22 10 22 12 22 14" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const MountainIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 18L8 10L14 17L22 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8" cy="10" r="1.5" fill={color} />
    <circle cx="14" cy="17" r="1.5" fill={color} />
  </svg>
)

export const CultureIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke={color} strokeWidth="2" />
    <path d="M12 6V18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M6 12H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const FoodieIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M11 8L8 11M11 14L8 11M11 14L14 11M11 8L14 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 3C16.3 3 15 4.3 15 6C15 8 18 12 18 12C18 12 21 8 21 6C21 4.3 19.7 3 18 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const NightlifeIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="4" r="1" fill={color} />
    <circle cx="19" cy="7" r="1" fill={color} />
    <circle cx="20" cy="11" r="1" fill={color} />
  </svg>
)

export const NatureIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14 8H20L15 12L17 18L12 14L7 18L9 12L4 8H10L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6" cy="18" r="1.5" fill={color} />
    <circle cx="18" cy="18" r="1.5" fill={color} />
  </svg>
)

export const ArrowRightIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5L19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ChevronDownIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ScrollIndicator = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 20 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2V18" stroke={color} strokeWidth="1.5" strokeDasharray="2,2" strokeLinecap="round" />
    <path d="M7 22L10 25L13 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const MenuIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 12H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 18H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

export const CloseIcon = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
