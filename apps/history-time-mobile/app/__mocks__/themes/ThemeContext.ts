/**
 * Mock implementation of ThemeContext for testing
 */
export const useAppTheme = () => ({
  theme: 'light',
  toggleTheme: jest.fn(),
  styles: {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#000000',
    primary: '#007bff',
    accent: '#ff4081',
    timelineColor: '#007bff',
    cardBackground: '#ffffff',
    cardText: '#000000',
  },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => children;
