import { randomBytes, scryptSync } from 'node:crypto';
import {
  CreateUserData,
  User,
  UserRepository,
} from '../repositories/user.repository';

export type RegisterUserInput = {
  name?: string;
  email?: string;
  password?: string;
};

export class ValidationError extends Error {}

export async function registerUser(
  input: RegisterUserInput,
  userRepository: UserRepository,
): Promise<User> {
  validateRegisterUserInput(input);

  const userData: CreateUserData = {
    name: input.name!.trim(),
    email: input.email!.trim().toLowerCase(),
    passwordHash: hashPassword(input.password!),
  };

  return userRepository.create(userData);
}

export function validateRegisterUserInput(input: RegisterUserInput) {
  if (!input.name?.trim()) {
    throw new ValidationError('Name is required.');
  }

  if (!input.email?.trim()) {
    throw new ValidationError('Email is required.');
  }

  if (!input.password?.trim()) {
    throw new ValidationError('Password is required.');
  }
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hashedPassword = scryptSync(password, salt, 64).toString('hex');

  return `${salt}:${hashedPassword}`;
}
