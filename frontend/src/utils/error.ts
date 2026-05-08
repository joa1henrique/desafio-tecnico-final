import axios from "axios";

//mapeamento de mensagens tecnicas para mensagens amigaveis em portugues
const translations: Record<string, string> = {
  "Invalid credentials": "E-mail ou senha incorretos.",
  "User not found": "Usuário não encontrado.",
  "Forbidden": "Você não tem permissão para realizar esta ação.",
  "Unauthorized": "Sessão expirada ou inválida. Por favor, faça login novamente.",
  "Missing token": "Token de autenticação ausente. Por favor, faça login.",
  "Invalid UUID": "O identificador informado é inválido.",
  "Solicitacao not found": "A solicitação de reembolso não foi encontrada.",
  "Solicitacao nao encontrada": "A solicitação de reembolso não foi encontrada.",
  "Categoria nao encontrada": "A categoria solicitada não existe.",
  "Categoria nao encontrada ou inativa": "A categoria selecionada não foi encontrada ou está inativa.",
  "Invalid status transition": "Esta transição de status não é permitida.",
  "Transicao de status invalida": "A mudança de status solicitada não é permitida para o estado atual.",
  "Solicitacao nao pode ser editada": "Esta solicitação não pode mais ser editada pois não está em rascunho.",
  "Tipo de arquivo invalido": "O formato do arquivo enviado não é suportado (use PDF, JPG ou PNG).",
  "Email already in use": "Este e-mail já está sendo utilizado por outro usuário.",
  "Category already exists": "Já existe uma categoria cadastrada com este nome.",
};

export function getApiErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    const message = data?.message || data?.error || error.message;

    //retorna a traduçao se existir no mapa, caso contrario retorna a mensagem original ou o fallback
    return translations[message] || message || fallback;
  }

  if (error instanceof Error) {
    return translations[error.message] || error.message;
  }

  return fallback;
}