const config = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          background: 'var(--background)',
          foreground: 'var(--foreground)',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          bounceSubtle: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-5px)' },
          },
        },
        boxShadow: {
          'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
          'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
      },
    },
    safelist: [
        'bg-blue-100', 'text-blue-800', 'border-blue-300',
        'dark:bg-blue-900/30', 'dark:text-blue-300', 'dark:border-blue-700',
        'bg-gray-100', 'text-gray-800', 'border-gray-300',
        'dark:bg-gray-700', 'dark:text-gray-300', 'dark:border-gray-600',
        'bg-red-100', 'text-red-800', 'border-red-300',
        'dark:bg-red-900/30', 'dark:text-red-300', 'dark:border-red-700',
        'bg-green-100', 'text-green-800', 'border-green-300',
        'dark:bg-green-900/30', 'dark:text-green-300', 'dark:border-green-700',
        'bg-purple-100', 'text-purple-800', 'border-purple-300',
        'dark:bg-purple-900/30', 'dark:text-purple-300', 'dark:border-purple-700',
        'bg-indigo-100', 'text-indigo-800', 'border-indigo-300',
        'dark:bg-indigo-900/30', 'dark:text-indigo-300', 'dark:border-indigo-700',
        'bg-gradient-to-br', 
        'from-gray-100', 'to-gray-200', 'dark:from-gray-700', 'dark:to-gray-800',
        'from-blue-100', 'to-blue-200', 'dark:from-blue-900/30', 'dark:to-blue-800/30',
        'from-red-100', 'to-red-200', 'dark:from-red-900/30', 'dark:to-red-800/30',
        'from-green-100', 'to-green-200', 'dark:from-green-900/30', 'dark:to-green-800/30',
        'from-purple-100', 'to-purple-200', 'dark:from-purple-900/30', 'dark:to-purple-800/30',
        'from-indigo-100', 'to-indigo-200', 'dark:from-indigo-900/30', 'dark:to-indigo-800/30',
        'ring-1', 'ring-inset',
        'ring-gray-300', 'dark:ring-gray-600',
        'ring-blue-300', 'dark:ring-blue-700',
        'ring-red-300', 'dark:ring-red-700',
        'ring-green-300', 'dark:ring-green-700',
        'ring-purple-300', 'dark:ring-purple-700',
        'ring-indigo-300', 'dark:ring-indigo-700',

        'hover:ring-2', 'hover:ring-offset-1', 'hover:ring-opacity-40'
    ],
    plugins: [],
  }
  
  export default config