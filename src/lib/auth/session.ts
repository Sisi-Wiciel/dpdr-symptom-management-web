import { UserRole } from "@prisma/client";
import { JWTPayload, jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "cds_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

const researchRoles: UserRole[] = [UserRole.RESEARCH_ASSISTANT, UserRole.PROJECT_OWNER, UserRole.PLATFORM_ADMIN];

export type ViewerSession = JWTPayload & {
  sub: string;
  email: string;
  displayName: string;
  role: UserRole;
};

const protectedRoutePrefixes = ["/patient", "/doctor", "/research"] as const;

function getAuthSecret() {
  const fallbackSecret = "local-development-auth-secret";
  const secret = process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : fallbackSecret);

  if (!secret) {
    throw new Error("Missing AUTH_SECRET. Set AUTH_SECRET before starting the app.");
  }

  return new TextEncoder().encode(secret);
}

export function getDefaultPathForRole(role: UserRole) {
  switch (role) {
    case UserRole.PATIENT:
      return "/patient";
    case UserRole.CLINICIAN:
      return "/doctor";
    case UserRole.RESEARCH_ASSISTANT:
    case UserRole.PROJECT_OWNER:
    case UserRole.PLATFORM_ADMIN:
      return "/research";
    default:
      return "/signin";
  }
}

export function getRoleLabel(role: UserRole) {
  switch (role) {
    case UserRole.PATIENT:
      return "患者";
    case UserRole.CLINICIAN:
      return "医生";
    case UserRole.RESEARCH_ASSISTANT:
      return "研究助理";
    case UserRole.PROJECT_OWNER:
      return "项目负责人";
    case UserRole.PLATFORM_ADMIN:
      return "平台管理员";
    default:
      return role;
  }
}

export function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

export function isRoleAllowedForPath(role: UserRole, pathname: string) {
  if (pathname.startsWith("/patient")) {
    return role === UserRole.PATIENT;
  }

  if (pathname.startsWith("/doctor")) {
    return role === UserRole.CLINICIAN;
  }

  if (pathname.startsWith("/research")) {
    return researchRoles.includes(role);
  }

  return true;
}

export function normalizeNextPath(nextPath: string | null | undefined) {
  if (!nextPath) {
    return null;
  }

  return nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : null;
}

export async function signSessionToken(payload: {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
}) {
  return new SignJWT({ email: payload.email, displayName: payload.displayName, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string | null | undefined) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.displayName !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return payload as ViewerSession;
  } catch {
    return null;
  }
}