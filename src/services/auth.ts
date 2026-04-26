export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterPayload {
  empresaNome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  empresaEmail: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
  latitude: number;
  longitude: number;
}

export interface AuthResult {
  token: string;
  companyName: string;
}

interface SupplierAccountRecord {
  empresaNome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  empresaEmail: string;
  adminNome: string;
  adminEmail: string;
  adminSenha: string;
  latitude: number;
  longitude: number;
}

const STORAGE_KEY = 'rotalog-supplier-accounts';

function getAccounts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [] as SupplierAccountRecord[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SupplierAccountRecord[]) : [];
  } catch {
    return [] as SupplierAccountRecord[];
  }
}

function saveAccounts(accounts: SupplierAccountRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function makeToken(payload: { companyName: string; email: string }) {
  const body = btoa(unescape(encodeURIComponent(JSON.stringify({
    sub: payload.email,
    companyName: payload.companyName,
    iat: Math.floor(Date.now() / 1000),
  }))));

  return `mock.jwt.${body}`;
}

function extractCompanyNameFromEmail(email: string) {
  const prefix = email.split('@')[0] || 'fornecedor';
  return prefix
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || 'Fornecedor';
}

export async function loginSupplier(payload: LoginPayload): Promise<AuthResult> {
  const accounts = getAccounts();
  const normalizedEmail = payload.email.trim().toLowerCase();

  const matched = accounts.find(account =>
    account.adminEmail.toLowerCase() === normalizedEmail ||
    account.empresaEmail.toLowerCase() === normalizedEmail,
  );

  if (matched) {
    if (matched.adminSenha !== payload.senha) {
      throw new Error('Senha invalida. Verifique e tente novamente.');
    }

    return {
      token: makeToken({ companyName: matched.empresaNome, email: matched.adminEmail }),
      companyName: matched.empresaNome,
    };
  }

  // Fallback para ambiente de desenvolvimento sem conta registrada.
  if (payload.senha.length >= 6) {
    const companyName = extractCompanyNameFromEmail(normalizedEmail);
    return {
      token: makeToken({ companyName, email: normalizedEmail }),
      companyName,
    };
  }

  throw new Error('Credenciais invalidas.');
}

export async function registerSupplier(payload: RegisterPayload): Promise<AuthResult> {
  const accounts = getAccounts();

  const cnpjDigits = payload.cnpj.replace(/\D/g, '');
  if (accounts.some(account => account.cnpj.replace(/\D/g, '') === cnpjDigits)) {
    throw new Error('Ja existe uma empresa cadastrada com este CNPJ.');
  }

  if (accounts.some(account => account.adminEmail.toLowerCase() === payload.adminEmail.toLowerCase())) {
    throw new Error('Ja existe um usuario admin com este e-mail.');
  }

  accounts.push({
    empresaNome: payload.empresaNome,
    cnpj: payload.cnpj,
    endereco: payload.endereco,
    telefone: payload.telefone,
    empresaEmail: payload.empresaEmail,
    adminNome: payload.adminNome,
    adminEmail: payload.adminEmail,
    adminSenha: payload.adminSenha,
    latitude: payload.latitude,
    longitude: payload.longitude,
  });

  saveAccounts(accounts);

  return {
    token: makeToken({ companyName: payload.empresaNome, email: payload.adminEmail }),
    companyName: payload.empresaNome,
  };
}
