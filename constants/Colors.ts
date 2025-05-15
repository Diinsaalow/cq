import { ThemeType } from '../contexts/ThemeContext';

const light = {
  primary: '#4CAF50',
  lightGray: '#F5F7FA',
  darkGray: '#64748B',
  textDark: '#1E293B',
  textLight: '#64748B',
  white: '#FFFFFF',
  background: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.1)',
  accent: '#22C55E',
  gradient: {
    start: '#4CAF50',
    end: '#22C55E',
  },
};

const dark = {
  primary: '#4CAF50',
  lightGray: '#23272F',
  darkGray: '#A0AEC0',
  textDark: '#F5F7FA',
  textLight: '#A0AEC0',
  white: '#181A20',
  background: '#181A20',
  shadow: 'rgba(0,0,0,0.7)',
  accent: '#22C55E',
  gradient: {
    start: '#4CAF50',
    end: '#22C55E',
  },
};

export function getColors(theme: ThemeType) {
  return theme === 'dark' ? dark : light;
}

export default getColors;
export { light as lightColors, dark as darkColors };
