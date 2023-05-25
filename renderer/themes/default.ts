import { ThemeProps } from '@react-bulk/core';

const theme = {
  mode: 'dark',

  typography: {
    fontSize: 12,
    lineHeight: 1.15,
  },

  colors: {
    primary: '#009688',
    secondary: '#f8bbd0',
  },

  components: {
    Backdrop: {
      defaultStyles: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
        },
      },
    },
    Badge: {
      defaultProps: {
        size: 3,
      },
      defaultStyles: {
        root: {
          fontFamily: 'Consolas, Courier',
        },
      },
    },
    Text: {
      defaultStyles: {
        root: {
          letterSpacing: 1,
        },
      },
    },
  },
} as ThemeProps;

export default theme;
