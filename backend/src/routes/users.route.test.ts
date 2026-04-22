import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../app';
import {
  CreateUserData,
  User,
  UserRepository,
} from '../repositories/user.repository';
import { hashPassword } from '../services/password.service';

class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];
  private sequence = 1;

  async create(data: CreateUserData): Promise<User> {
    const user: User = {
      id: this.sequence++,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: new Date(),
    };

    this.users.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  list() {
    return this.users;
  }
}

test('POST /users creates a new user successfully', async () => {
  const userRepository = new InMemoryUserRepository();
  const app = await buildApp({ userRepository });

  const response = await app.inject({
    method: 'POST',
    url: '/users',
    payload: {
      name: 'Maria Silva',
      email: 'maria@example.com',
      password: '123456',
    },
  });

  assert.equal(response.statusCode, 201);

  const body = response.json();
  assert.equal(body.name, 'Maria Silva');
  assert.equal(body.email, 'maria@example.com');

  const [savedUser] = userRepository.list();
  assert.ok(savedUser);
  assert.notEqual(savedUser.passwordHash, '123456');

  await app.close();
});

test('POST /users rejects duplicated email', async () => {
  const userRepository = new InMemoryUserRepository();
  await userRepository.create({
    name: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: 'already-hashed',
  });

  const app = await buildApp({ userRepository });

  const response = await app.inject({
    method: 'POST',
    url: '/users',
    payload: {
      name: 'Outra Maria',
      email: 'maria@example.com',
      password: 'abcdef',
    },
  });

  assert.equal(response.statusCode, 409);
  assert.deepEqual(response.json(), {
    message: 'Email already registered.',
  });

  await app.close();
});

test('POST /auth/login returns a JWT for valid credentials', async () => {
  const userRepository = new InMemoryUserRepository();
  const savedUser = await userRepository.create({
    name: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: hashPassword('123456'),
  });
  const app = await buildApp({
    userRepository,
    jwtSecret: 'test-secret',
  });

  const loginResponse = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      email: 'maria@example.com',
      password: '123456',
    },
  });

  assert.equal(loginResponse.statusCode, 200);
  assert.equal(typeof loginResponse.json().token, 'string');

  const profileResponse = await app.inject({
    method: 'GET',
    url: '/profile',
    headers: {
      authorization: `Bearer ${loginResponse.json().token}`,
    },
  });

  assert.equal(profileResponse.statusCode, 200);
  assert.deepEqual(profileResponse.json(), {
    id: savedUser.id,
    name: savedUser.name,
    email: savedUser.email,
  });

  await app.close();
});

test('POST /auth/login rejects invalid credentials', async () => {
  const userRepository = new InMemoryUserRepository();
  await userRepository.create({
    name: 'Maria Silva',
    email: 'maria@example.com',
    passwordHash: hashPassword('123456'),
  });
  const app = await buildApp({
    userRepository,
    jwtSecret: 'test-secret',
  });

  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: {
      email: 'maria@example.com',
      password: 'senha-errada',
    },
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json(), {
    message: 'Invalid email or password.',
  });

  await app.close();
});

test('GET /profile requires authentication', async () => {
  const userRepository = new InMemoryUserRepository();
  const app = await buildApp({
    userRepository,
    jwtSecret: 'test-secret',
  });

  const response = await app.inject({
    method: 'GET',
    url: '/profile',
  });

  assert.equal(response.statusCode, 401);
  assert.deepEqual(response.json(), {
    message: 'Unauthorized.',
  });

  await app.close();
});
