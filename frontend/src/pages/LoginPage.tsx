import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/utils/error";

const initialForm = {
  email: "",
  senha: "",
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Falha ao fazer login"));
    }
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 72px)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 4,
          boxShadow: "0 28px 70px rgba(10, 20, 40, 0.25)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.92)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" color="primary" fontWeight={800}>
                Acesso ao sistema
              </Typography>
              <Typography variant="h4" fontWeight={900} gutterBottom>
                Entre no painel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use suas credenciais para acessar a área protegida e iniciar o fluxo de despesas.
              </Typography>
            </Box>

            <Divider />

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="E-mail"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  fullWidth
                  required
                />

                <TextField
                  label="Senha"
                  type="password"
                  value={form.senha}
                  onChange={(event) => setForm((current) => ({ ...current, senha: event.target.value }))}
                  fullWidth
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  startIcon={<LockOutlinedIcon />}
                  sx={{ py: 1.4, fontWeight: 800 }}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}