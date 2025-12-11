import http from 'k6/http';
import { check } from 'k6';
import { baseURL } from './baseURL.js';

export function login(email, password) {
  const url = `${baseURL()}/auth/login`;
  const payload = JSON.stringify({ email, password });
  const params = { headers: { 'Content-Type': 'application/json' } };
  const res = http.post(url, payload, params);
  check(res, { 'login status 200': (r) => r.status === 200 });
  const token = res.json('data.token');
  return token;
}