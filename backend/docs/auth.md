# Auth

## Login

- Endpoint: POST /auth/login
- Body:
  {
    "email": "admin@exemplo.com",
    "senha": "admin123"
  }
- Resposta:
  {
    "token": "jwt",
    "user": {
      "id": "...",
      "nome": "Admin",
      "email": "admin@exemplo.com",
      "perfil": "ADMIN"
    }
  }

O login tambem seta um cookie httpOnly com o JWT:
- Nome: auth_token (configuravel por COOKIE_NAME)
- Flags: httpOnly, secure, sameSite

## Protecao de rotas

- Rotas protegidas aceitam:
  - Header Authorization: Bearer <token>
  - Cookie httpOnly (auth_token)

## Identificacao do usuario logado

- O middleware de autenticacao valida o JWT e injeta:
  req.user = { id, perfil }
- As permissoes sao aplicadas via RBAC nas rotas com requireRole.
