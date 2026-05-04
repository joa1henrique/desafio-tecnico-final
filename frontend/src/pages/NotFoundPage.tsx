import { Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Stack spacing={2} alignItems="flex-start" sx={{ py: 6 }}>
      <Typography variant="overline" color="primary" fontWeight={800}>
        404
      </Typography>
      <Typography variant="h3" fontWeight={900}>
        Página não encontrada
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 540 }}>
        O endereço acessado não existe nesta base do frontend.
      </Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Voltar ao painel
      </Button>
    </Stack>
  );
}