import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#388e3c",    // Green
      light: "#66bb6a",
      dark: "#2e7d32",
      contrastText: "#fff",
    },
    secondary: {
      main: "#616161",    // Grey
      light: "#9e9e9e",
      dark: "#424242",
      contrastText: "#fff",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

export default theme;
