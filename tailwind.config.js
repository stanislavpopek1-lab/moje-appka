/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
      fontFamily: {
        heading: ['var(--font-heading)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 4px)',
  			sm: 'calc(var(--radius) - 8px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--primary))',
  				'2': 'hsl(25 80% 60%)',
  				'3': 'hsl(200 70% 55%)',
  				'4': 'hsl(43 74% 66%)',
  				'5': 'hsl(280 60% 55%)'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--foreground))',
  				primary: 'hsl(var(--primary))',
  				'primary-foreground': 'hsl(var(--primary-foreground))',
  				accent: 'hsl(var(--accent))',
  				'accent-foreground': 'hsl(var(--accent-foreground))',
  				border: 'hsl(var(--border))',
  				ring: 'hsl(var(--ring))'
  			}
  		},
      backgroundImage: {
        'gradient-flame': 'linear-gradient(135deg, hsl(42 90% 55%), hsl(35 80% 50%))',
        'gradient-dark': 'linear-gradient(180deg, transparent, hsl(35 25% 5%))',
      },
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(218,165,32,0.25)' },
          '50%': { boxShadow: '0 0 50px rgba(218,165,32,0.55)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
