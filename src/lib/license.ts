import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Plan } from "./types";

export const LICENSE_COOKIE = "lotly_license";

function secretKey() {
  const secret =
    process.env.LICENSE_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    "lotly-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function issueProLicense(email?: string): Promise<string> {
  return new SignJWT({
    plan: "pro" as Plan,
    email: email ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10y")
    .setSubject("lotly-pro")
    .sign(secretKey());
}

export async function verifyLicense(
  token: string | undefined,
): Promise<Plan> {
  if (!token) return "free";
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.plan === "pro") return "pro";
    return "free";
  } catch {
    return "free";
  }
}

export async function getPlanFromCookies(): Promise<Plan> {
  const jar = await cookies();
  return verifyLicense(jar.get(LICENSE_COOKIE)?.value);
}
