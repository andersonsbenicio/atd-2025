import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { randomEmail } from './helpers/randomEmail.js';
import { baseURL } from './helpers/baseURL.js';
import { login } from './helpers/login.js';
import faker from "k6/x/faker"

export let options = {
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% das requests devem ser < 2s
  },
  stages: [
    { duration: '3s', target: 10 }, // Ramp up
    { duration: '15s', target: 10 }, // Average
    { duration: '2s', target: 100 }, // Spike
    { duration: '3s', target: 100 }, // Spike
    { duration: '5s', target: 10 }, // Average
    { duration: '5s', target: 0 }, // Ramp down
  ],
};

const checkoutTrend = new Trend('checkout_duration');

export default function () {
  let email, password, token;
  group('Register User', function () {
    email = randomEmail();
    password = faker.internet.password();
    const url = `${baseURL()}/auth/register`;
    const payload = JSON.stringify({
      email: email,
      password: password,
      name: faker.person.firstName()
    });
    const params = { headers: { 'Content-Type': 'application/json' } };
    const res = http.post(url, payload, params);
    check(res, { 'register status 201': (r) => r.status === 201 });
  });

  group('Login User', function () {
    token = login(email, password);
  });

  group('Checkout', function () {
    const url = `${baseURL()}/checkout`;
    const payload = JSON.stringify({
      items: [
        { productId: 1, quantity: 1 }
      ],
      paymentMethod: 'cash'
    });
    const params = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    };
    const start = Date.now();
    const res = http.post(url, payload, params);
    const duration = Date.now() - start;
    checkoutTrend.add(duration);
    // ...
    check(res, { 'checkout status 200': (r) => r.status === 200 });
  });
  sleep(1);
}