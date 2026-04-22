import { UserRepository } from '../repositories/user.repository';
import { verifyPassword } from './password.service';

export type LoginInput = {
  email?: string;
  password?: string;
};

export class LoginValidationError extends Error {}
export class InvalidCredentialsError extends Error {}

export async function authenticateUser(
  input: LoginInput,
  userRepository: UserRepository,
) {
  validateLoginInput(input);

  const normalizedEmail = input.email!.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail);

  if (!user || !verifyPassword(input.password!, user.passwordHash)) {
    throw new InvalidCredentialsError('Invalid email or password.');
  }

  return user;
}

function validateLoginInput(input: LoginInput) {
  if (!input.email?.trim()) {
    throw new LoginValidationError('Email is required.');
  }

  if (!input.password?.trim()) {
    throw new LoginValidationError('Password is required.');
  }
}
