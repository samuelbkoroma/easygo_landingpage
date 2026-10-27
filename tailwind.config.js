/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mirrors the shared Flutter design system:
        // easygo / easygo_admin / easygoriders → lib/core/theme/app_colors.dart
        easygo: {
          // Brand anchors
          primary: '#005232',      // AppColors.primary — deep emerald
          container: '#0E6C45',    // AppColors.primaryContainer
          secondary: '#006C49',    // AppColors.secondary
          velocity: '#10B981',     // AppColors.velocityGreen — emerald accent
          pulse: '#00E676',        // AppColors.pulseGreen
          neon: '#6CF8BB',         // AppColors.neonBright
          mint: '#96EAB9',         // AppColors.onPrimaryContainer
          foam: '#A0F4C3',         // AppColors.primaryFixed
          // Hero gradient (AppColors.heroGradientStart/End)
          heroFrom: '#00502E',
          heroTo: '#003820',
          deep: '#013621',         // splash emerald
          // Darks
          ink: '#0B1C30',          // AppColors.onSurface
          night: '#0F172A',        // AppColors.slateDark
          // Surfaces
          mist: '#F8F9FF',         // AppColors.background / surface
          line: '#E2E8F0',         // AppColors.divider
          // Accents
          gold: '#FFB800',         // AppColors.starGold
          slGreen: '#1EB53A',      // Sierra Leone flag green
          slBlue: '#0072C6',       // Sierra Leone flag blue
          // Text
          primaryText: '#0B1C30',  // AppColors.textPrimary
          secondaryText: '#64748B',// AppColors.textSecondary
          mutedText: '#94A3B8',    // AppColors.textMuted
          // Semantic
          successBg: '#E6F7F0',
          successFg: '#00714D',
          sos: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'fade-up': 'fade-up 0.8s ease-out both',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
