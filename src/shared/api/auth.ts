const TOKEN_KEY = 'lactare_admin_token';
const ADMIN_ID_KEY = 'lactare_admin_id';
const ADMIN_NOME_KEY = 'lactare_admin_nome';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function setAdmin(id: number, nome: string | undefined) {
  localStorage.setItem(ADMIN_ID_KEY, String(id));
  if (nome) localStorage.setItem(ADMIN_NOME_KEY, nome);
}

export function getAdminId() {
  const raw = localStorage.getItem(ADMIN_ID_KEY);
  return raw ? Number(raw) : null;
}

export function getAdminNome() {
  return localStorage.getItem(ADMIN_NOME_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_ID_KEY);
  localStorage.removeItem(ADMIN_NOME_KEY);
}

export function isAuthenticated() {
  return getToken() !== null;
}
