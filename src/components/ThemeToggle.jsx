import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
      style={{
        background: isDark ? '#1a1a1a' : '#f0f0f0',
        border: isDark ? '1px solid #2a2a2a' : '1px solid #d0d0d0',
        color: isDark ? '#a78bfa' : '#7c3aed',
      }}
    >
      <span>{isDark ? '☀️' : '🌙'}</span>
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  )
}
