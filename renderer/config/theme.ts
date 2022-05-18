import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontSize: 12,
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  components: {
    MuiInputLabel: {
      defaultProps: {
        shrink: true,
      },
    },
    MuiCheckbox: {
      defaultProps: {
        size: 'small',
        color: 'secondary',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
        color: 'secondary',
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        color: 'secondary',
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontSize: 12,
          backgroundColor: '#333333',
          padding: 16,
        },
        '*::placeholder': {
          fontSize: '.8em',
        },
        '*': {
          scrollbarWidth: 'thin',
        },
        '*::-webkit-scrollbar': {
          height: 8,
          width: 8,
        },
        '*::-webkit-scrollbar-track': {
          borderRadius: 'inherit',
          backgroundColor: 'rgba(0, 0, 0, .1)',
        },
        '*::-webkit-scrollbar-thumb': {
          borderRadius: 'inherit',
          backgroundColor: 'darkgrey',
        },
        a: {
          display: 'inline-block',
        },
      },
    },
  },
});
