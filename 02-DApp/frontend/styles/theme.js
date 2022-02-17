import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    type: 'dark',
    background: {
      main: '#2E0744'    },
    primary: {
      main: '#2E0744',
      dark: '#2E0744',
      light: '#9b42f5',
      contrastText: '#40fff2',
    },
    secondary: {
      main: '#40fff2',
      light: 'white',
      contrastText: '#40fff2',
    },
  },
  overrides: {
    MuiButton: {
      label: {
        color: 'white',
      },
    },
  }
});

export default theme;