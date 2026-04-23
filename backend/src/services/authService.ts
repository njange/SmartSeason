import { z } from 'zod';
import { findUserByEmail } from '../repositories/userRepository';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function login(input: z.infer<typeof loginSchema>) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const valid = await comparePassword(input.password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken({
    userId: user.id,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}
