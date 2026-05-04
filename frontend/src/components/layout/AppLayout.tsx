import type { ReactNode } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AppLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { user, logout, isLoading } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(14px)",
          background:
            "linear-gradient(135deg, rgba(12, 22, 41, 0.92), rgba(20, 92, 150, 0.86))",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} component={RouterLink} to="/dashboard" sx={{ color: "inherit", textDecoration: "none" }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.secondary.main,
                color: theme.palette.secondary.contrastText,
              }}
            >
              <DashboardRoundedIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1}>
                Desafio Técnico
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                Frontend base
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1.5}>
            {user ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box textAlign="right">
                  <Typography variant="body2" fontWeight={700}>
                    {user.nome}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>
                    {user.perfil}
                  </Typography>
                </Box>
                <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(255,255,255,0.18)" }}>
                  {user.nome.charAt(0).toUpperCase()}
                </Avatar>
              </Stack>
            ) : null}

            <Button
              variant="outlined"
              onClick={() => void logout()}
              disabled={isLoading}
              startIcon={<LogoutRoundedIcon />}
              sx={{
                color: "white",
                borderColor: "rgba(255,255,255,0.24)",
                "&:hover": { borderColor: "white" },
              }}
            >
              Sair
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </Box>
  );
}