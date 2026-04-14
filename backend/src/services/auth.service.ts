import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { signToken } from "../utils/jwt.js";

type UserRow = {
  id: string;
  full_name: string;
  username: string | null;
  email: string;
  role: "member" | "trainer" | "admin";
  password_hash: string;
};

export async function loginUser(
  identifier: string,
  password: string,
  expectedRole?: "member" | "trainer" | "admin"
) {
  const result = await query<UserRow>(
    `
      SELECT id, full_name, username, email, role, password_hash
      FROM users
      WHERE email = $1 OR username = $1
      LIMIT 1
    `,
    [identifier]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new Error("Kullanıcı adı veya şifre hatalı.");
  }

  if (expectedRole && user.role !== expectedRole) {
    throw new Error("Bu hesap seçilen giriş tipine ait değil.");
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    fullName: user.full_name
  });

  return {
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    }
  };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const result = await query<UserRow>(
    `
      SELECT id, full_name, username, email, role, password_hash
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  const user = result.rows[0];
  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new Error("Mevcut şifre doğru değil.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await query(`UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`, [userId, passwordHash]);
  return { message: "Şifre başarıyla güncellendi." };
}

export async function resetPassword(
  identifier: string,
  phoneLast4: string,
  expectedRole?: "member" | "trainer" | "admin"
) {
  const result = await query<UserRow & { phone: string | null }>(
    `
      SELECT id, full_name, username, email, role, password_hash, phone
      FROM users
      WHERE email = $1 OR username = $1
      LIMIT 1
    `,
    [identifier]
  );

  const user = result.rows[0];
  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  if (expectedRole && user.role !== expectedRole) {
    throw new Error("Bu hesap seçilen giriş tipine ait değil.");
  }

  const cleanedPhone = (user.phone ?? "").replace(/\D/g, "");
  if (!cleanedPhone || cleanedPhone.slice(-4) !== phoneLast4.replace(/\D/g, "")) {
    throw new Error("Telefon doğrulaması başarısız.");
  }

  const tempPassword = `Serin${Math.random().toString(36).slice(2, 6).toUpperCase()}!${cleanedPhone.slice(-2)}`;
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  await query(`UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1`, [user.id, passwordHash]);

  return {
    message: "Geçici şifre oluşturuldu.",
    tempPassword
  };
}
