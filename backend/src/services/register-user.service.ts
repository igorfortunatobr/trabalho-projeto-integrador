import {
  CreateUserData,
  User,
  UserRepository,
} from '../repositories/user.repository';
import { hashPassword } from './password.service';

export type RegisterUserInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: 'student' | 'instructor';
};

export class ValidationError extends Error {}
export class DuplicateEmailError extends Error {}

export async function registerUser(
  input: RegisterUserInput,
  userRepository: UserRepository,
): Promise<User> {
  validateRegisterUserInput(input);

  const normalizedEmail = input.email!.trim().toLowerCase();
  const existingUser = await userRepository.findByEmail(normalizedEmail);

  if (existingUser) {
    throw new DuplicateEmailError('Email already registered.');
  }

  const userData: CreateUserData = {
    name: input.name!.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(input.password!),
    role: input.role!,
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

  if (input.role !== 'student' && input.role !== 'instructor') {
    throw new ValidationError('Role must be student or instructor.');
  }
}
