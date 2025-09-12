import { check, sleep } from 'k6';
import http from 'k6/http';
import { Options } from 'k6/options';

export const options: Options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 }, // Stay at 20 users
    { duration: '30s', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export default function() {
  // Test login endpoint
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'password123',
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  sleep(1);

  // Test register endpoint
  const registerRes = http.post(`${BASE_URL}/api/auth/register`, {
    email: `test${__VU}@example.com`,
    password: 'password123',
    name: 'Test User',
  });

  check(registerRes, {
    'register status is 200': (r) => r.status === 200,
    'register response has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  sleep(1);
} 