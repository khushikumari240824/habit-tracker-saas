import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../db/schema";
import { signToken } from "../utils/jwt";
import { RegisterInput, LoginInput } from "../validators/auth.validator";

const SALT_ROUNDS = 10;

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}

export async function registerUser(input: RegisterInput) {
  const { name, email, password } = input;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    });

  const token = signToken({ userId: newUser.id, email: newUser.email });

  return { user: newUser, token };
}

export async function loginUser(input: LoginInput) {
  const { email, password } = input;

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingUser) {
    throw new AuthError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    existingUser.passwordHash
  );

  if (!isPasswordValid) {
    throw new AuthError("Invalid email or password", 401);
  }

  const token = signToken({
    userId: existingUser.id,
    email: existingUser.email,
  });

  return {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      createdAt: existingUser.createdAt,
    },
    token,
  };
}