import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#388e3c',      // Leafy Green
      contrastText: '#fff',
    },
    secondary: {
      main: '#a5d6a7',      // Light Green
      contrastText: '#2e7d32',
    },
    background: {
      default: '#f1f8e9',   // Very Light Green
      paper: '#fff',
    },
    accent: {
      main: '#8d6e63',      // Earthy Brown
    },
    text: {
      primary: '#2e7d32',   // Deep Green
      secondary: '#388e3c',
    },
  },
  typography: {
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },
});

export default theme;