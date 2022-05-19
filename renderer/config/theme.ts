import { red, teal } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const primary = {
  main: '#f8bbd0',
};

const secondary = {
  main: teal['500'],
};

export const theme = createTheme({
  typography: {
    fontSize: 12,
  },
  palette: {
    mode: 'dark',
    primary,
    secondary,
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
        color: 'primary',
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
        color: 'primary',
        variant: 'outlined',
        fullWidth: true,
        displayEmpty: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        color: 'primary',
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
        'input[type="checkbox"]': {
          mx: 1,
          height: 16,
          width: 16,
          accentColor: primary.main,
        },
      },
    },
  },
});
