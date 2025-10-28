/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Satoshi', 'system-ui', 'sans-serif'],
        'body': ['Satoshi', 'system-ui', 'sans-serif'],
        'heading': ['Satoshi', 'system-ui', 'sans-serif'],
        'cursive': ['Dancing Script', 'cursive'],       // Primary cursive - use everywhere except journal
        'handwriting': ['Dancing Script', 'cursive'],   // Same as cursive for consistency
        'journal': ['Indie Flower', 'cursive'],         // ONLY for journal entries
        'details': ['Work Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Whimsical Coastal Calm - Primary Ocean Blues
        seafoam: {
          mist: '#EAF6F8',     // Backgrounds, large sections
        },
        turquoise: {
          tide: '#9ADCE0',     // Secondary fills, icons
        },
        aqua: {
          soft: '#73C8D3',     // Buttons, wave dividers
        },
        ocean: {
          deep: '#2B5E7B',     // Text accents, headers
          midnight: '#1E3D52', // CTAs, hover states
          // Legacy compatibility mappings
          50: '#EAF6F8',
          100: '#EAF6F8',
          200: '#9ADCE0',
          300: '#73C8D3',
          400: '#73C8D3',
          500: '#2B5E7B',
          600: '#2B5E7B',
          800: '#1E3D52',
        },
        // Warm Neutrals (Shells & Sand)
        shell: {
          white: '#FFF9F2',    // Cards, nav, modals
          500: '#D6C7F5',      // Lavender shell (legacy)
        },
        driftwood: {
          beige: '#E8D9C6',    // Background texture
        },
        sea: {
          pebble: '#C4B7A6',   // Divider lines, text-muted
        },
        // Sunset Accents
        blush: {
          coral: '#F5B7B1',    // Heart icons, tooltips, highlights
          300: '#F5B7B1',      // Legacy
        },
        peach: {
          glow: '#FFD3B5',     // Button hover, gradients
        },
        lavender: {
          shell: '#D6C7F5',    // Animated gradients, badges
        },
        // Legacy sand mapping for compatibility
        sand: {
          100: '#FFF9F2',
          300: '#FFD3B5',
        },
        // Text colors
        text: {
          800: '#2B5E7B',
          900: '#1E3D52',
        },
        muted: {
          500: '#C4B7A6',
        },
        // Mood colors (keeping existing for compatibility)
        mood: {
          joy: '#fbbf24',
          happy: '#34d399',
          neutral: '#94a3b8',
          sad: '#60a5fa',
          angry: '#f87171',
          anxious: '#a78bfa',
          excited: '#fb923c',
          calm: '#86efac',
        }
      },
      borderRadius: {
        'soft': '1.5rem',
        'cozy': '2rem',
      },
      boxShadow: {
        'soft': '0 8px 32px rgba(43, 94, 123, 0.08)',
        'soft-lg': '0 16px 48px rgba(43, 94, 123, 0.12)',
        'glow': '0 0 20px rgba(115, 200, 211, 0.4)',
        'coastal': '0 4px 16px rgba(115, 200, 211, 0.2)',
        'sunset': '0 4px 16px rgba(245, 183, 177, 0.3)',
        'lavender': '0 4px 16px rgba(214, 199, 245, 0.3)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'breathe': 'breathe 3s ease-in-out infinite',
        'spin-bounce': 'spin-bounce 1s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg) scale(1.1)' },
          '75%': { transform: 'rotate(10deg) scale(1.1)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        'spin-bounce': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.4)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}

