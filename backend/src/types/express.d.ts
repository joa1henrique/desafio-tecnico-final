import { PerfilUsuario } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        perfil: PerfilUsuario;
      };
    }
  }
}

export {};
