import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";

const quickActions = [
  {
    title: "Nova solicitação",
    description: "Abra um rascunho para registrar uma despesa.",
    icon: AddRoundedIcon,
    tone: "primary" as const,
  },
  {
    title: "Minhas solicitações",
    description: "Acompanhe status, histórico e anexos.",
    icon: ReceiptLongRoundedIcon,
    tone: "secondary" as const,
  },
  {
    title: "Categorias",
    description: "Gerencie os agrupamentos usados nas despesas.",
    icon: CategoryRoundedIcon,
    tone: "info" as const,
  },
  {
    title: "Usuários",
    description: "Cadastre perfis e libere acessos administrativos.",
    icon: PeopleAltRoundedIcon,
    tone: "success" as const,
  },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <Stack spacing={3.5}>
        <Card
          sx={{
            overflow: "hidden",
            borderRadius: 4,
            color: "white",
            background:
              "linear-gradient(135deg, rgba(15, 25, 45, 0.96), rgba(33, 108, 175, 0.92))",
            boxShadow: "0 24px 60px rgba(11, 20, 36, 0.22)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Chip
                label={`Perfil: ${user?.perfil ?? "-"}`}
                sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.14)", color: "white" }}
              />
              <Box>
                <Typography variant="h3" fontWeight={900} gutterBottom>
                  Bem-vindo, {user?.nome ?? "usuário"}
                </Typography>
                <Typography variant="body1" sx={{ maxWidth: 760, opacity: 0.86 }}>
                  Esta base já deixa pronto o fluxo de autenticação, proteção de rotas e acesso à API.
                  A partir daqui você pode construir cadastro, listagem, aprovação e anexos sem refazer a estrutura.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          useFlexGap
          flexWrap="wrap"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Card key={action.title} sx={{ flex: "1 1 260px", borderRadius: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 3,
                        bgcolor: `${action.tone}.light`,
                        color: `${action.tone}.dark`,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                    <Button variant="text" sx={{ width: "fit-content", fontWeight: 700 }}>
                      Abrir
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </AppLayout>
  );
}