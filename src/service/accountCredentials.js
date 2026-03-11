const ACCOUNT_CREDENTIALS = [];

function ensureByOwner(ownerUserId) {
  const index = ACCOUNT_CREDENTIALS.findIndex((item) => item.ownerUserId === ownerUserId);
  if (index >= 0) return index;

  ACCOUNT_CREDENTIALS.push({
    ownerUserId,
    email: '',
    password: 'portal123',
    updatedAt: new Date().toISOString(),
  });

  return ACCOUNT_CREDENTIALS.length - 1;
}

export function ensureAccountCredentials({ ownerUserId, email, password }) {
  if (!ownerUserId) throw new Error('Usuário inválido para credenciais.');

  const index = ensureByOwner(ownerUserId);
  const current = ACCOUNT_CREDENTIALS[index];

  ACCOUNT_CREDENTIALS[index] = {
    ...current,
    email: email !== undefined ? String(email || '').trim() : current.email,
    password: password !== undefined ? String(password || '').trim() : current.password,
    updatedAt: new Date().toISOString(),
  };

  return ACCOUNT_CREDENTIALS[index];
}

export function getAccountCredentials(ownerUserId) {
  if (!ownerUserId) return null;
  return ACCOUNT_CREDENTIALS.find((item) => item.ownerUserId === ownerUserId) ?? null;
}

export function updateAccountPassword({ ownerUserId, currentPassword, newPassword }) {
  if (!ownerUserId) throw new Error('Usuário inválido para alterar senha.');

  const index = ensureByOwner(ownerUserId);
  const current = ACCOUNT_CREDENTIALS[index];

  if (String(currentPassword || '') !== String(current.password || '')) {
    throw new Error('Senha atual incorreta.');
  }

  const nextPassword = String(newPassword || '').trim();
  if (nextPassword.length < 8) {
    throw new Error('A nova senha precisa ter ao menos 8 caracteres.');
  }

  ACCOUNT_CREDENTIALS[index] = {
    ...current,
    password: nextPassword,
    updatedAt: new Date().toISOString(),
  };

  return ACCOUNT_CREDENTIALS[index];
}
