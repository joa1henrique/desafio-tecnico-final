export type UserRole = "COLABORADOR" | "GESTOR" | "FINANCEIRO" | "ADMIN";

export type User = {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
};

export type LoginInput = {
  email: string;
  senha: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type AuthSession = AuthResponse;

export type ApiPage<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type Category = {
  id: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type ReimbursementStatus =
  | "RASCUNHO"
  | "ENVIADO"
  | "APROVADO"
  | "REJEITADO"
  | "PAGO"
  | "CANCELADO";

export type ReimbursementAttachment = {
  id: string;
  solicitacaoId: string;
  nomeArquivo: string;
  urlArquivo: string;
  tipoArquivo: string;
  criadoEm: string;
};

export type ReimbursementHistoryEntry = {
  id: string;
  solicitacaoId: string;
  usuarioId: string;
  acao: string;
  observacao: string;
  criadoEm: string;
};

export type Reimbursement = {
  id: string;
  solicitanteId: string;
  categoriaId: string;
  descricao: string;
  valor: string;
  dataDespesa: string;
  status: ReimbursementStatus;
  justificativaRejeicao?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  solicitante?: User;
  categoria?: Category;
  anexos?: ReimbursementAttachment[];
  historicos?: ReimbursementHistoryEntry[];
};

export type CreateReimbursementInput = {
  categoriaId: string;
  descricao: string;
  valor: string | number;
  dataDespesa: string;
};

export type UpdateReimbursementInput = Partial<CreateReimbursementInput>;

export type RejectReimbursementInput = {
  justificativaRejeicao: string;
};

export type CreateUserInput = {
  nome: string;
  email: string;
  senha: string;
  perfil: UserRole;
};

export type CreateCategoryInput = {
  nome: string;
  ativo?: boolean;
};

export type CreateAttachmentInput = {
  nomeArquivo: string;
  urlArquivo: string;
  tipoArquivo: string;
};