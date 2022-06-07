import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    type: "dark",
    mode: "dark",
    background: {
      dark: "#2E0744",
      default: "#2E0744",
    },
    primary: {
      main: "#fafafa",
      dark: "#2E0744",
      light: "#9b42f5",
      contrastText: "#40fff2",
      charcoal: "#2E2E2E",
      mainGradient: "linear-gradient(95.66deg, #5A165B 0%, #AA10AD 100%)",
    },
    secondary: {
      main: "#0dd1d1",
      light: "white",
      contrastText: "#76ded7",
    },
  },
  typography: {
    fontFamily: ["Exo", "sans-serif"].join(","),
  },
  overrides: {
    Button: {
      label: {
        color: "#2E0744",
      },
      color: "black",
    },
  },
});

export default theme;
