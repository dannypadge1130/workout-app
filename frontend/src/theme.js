import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0050A0', // Vault-Tec Blue
      contrastText: '#FBE850', // Pip-Boy Yellow for contrast
    },
    secondary: {
      main: '#FBE850', // Pip-Boy Yellow
      contrastText: '#0050A0', // Vault-Tec Blue for contrast
    },
    background: {
      default: '#F8F3E3', // Retro Cream
      paper: '#fff',
    },
    error: {
      main: '#D44D4D', // Highlight Red
      contrastText: '#fff',
    },
    accent: {
      main: '#FBE850', // Pip-Boy Yellow as accent
    },
    text: {
      primary: '#333333', // Wasteland Gray
      secondary: '#0050A0', // Vault-Tec Blue
    },
  },
  typography: {
    fontFamily: '"Futura Condensed Extra Bold", "Segoe UI", Arial, sans-serif',
  },
});

export default theme;