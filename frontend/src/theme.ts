import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f5eff",
      dark: "#1237a8",
      light: "#5e87ff",
    },
    secondary: {
      main: "#ef6c00",
      dark: "#b24c00",
      light: "#ff9d3f",
    },
    background: {
      default: "#f3f6fc",
      paper: "rgba(255,255,255,0.94)",
    },
    text: {
      primary: "#0f172a",
      secondary: "#52607a",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: ['"Inter"', '"Segoe UI"', "system-ui", "sans-serif"].join(","),
    h1: { fontWeight: 900 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 900 },
    h4: { fontWeight: 900 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top left, rgba(31,94,255,0.12), transparent 32%), radial-gradient(circle at 80% 20%, rgba(239,108,0,0.10), transparent 28%), linear-gradient(180deg, #f7f9fe 0%, #eef3fb 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(15, 23, 42, 0.06)",
        },
      },
    },
  },
});