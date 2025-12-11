// Obtém a BASE_URL da variável de ambiente
export function baseURL() {
  return __ENV.BASE_URL || 'http://localhost:3000';
}