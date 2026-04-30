import "server-only";

import { compare } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  getDefaultPathForRole,
  normalizeNextPath,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  type ViewerSession,
  verifySessionToken,
} from "@/lib/auth/session";

const researchRoles: UserRole[] = [UserRole.RESEARCH_ASSISTANT, UserRole.PROJECT_OWNER, UserRole.PLATFORM_ADMIN];

function buildSignInRedirect(nextPath?: string | null) {
  const normalizedNext = normalizeNextPath(nextPath);

  if (!normalizedNext) {
    return "/signin";
  }

  const params = new URLSearchParams({ next: normalizedNext });
  return `/signin?${params.toString()}`;
}

export async function createViewerSession(user: {
  id: string;
  email: string;
  displayName: string;
  primaryRole: UserRole;
}) {
  const token = await signSessionToken({
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.primaryRole,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearViewerSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getViewerSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireViewerSession(allowedRoles?: UserRole[], nextPath?: string) {
  const session = await getViewerSession();

  if (!session) {
    redirect(buildSignInRedirect(nextPath));
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(getDefaultPathForRole(session.role));
  }

  return session;
}

export async function redirectIfAuthenticated() {
  const session = await getViewerSession();

  if (session) {
    redirect(getDefaultPathForRole(session.role));
  }
}

export async function authenticateWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      displayName: true,
      primaryRole: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash) {
    return null;
  }

  const matches = await compare(password, user.passwordHash);

  if (!matches) {
    return null;
  }

  return user;
}

export function getSafeDestination(session: ViewerSession, nextPath: string | null | undefined) {
  const normalizedNext = normalizeNextPath(nextPath);

  if (!normalizedNext) {
    return getDefaultPathForRole(session.role);
  }

  if (
    (normalizedNext.startsWith("/patient") && session.role === UserRole.PATIENT) ||
    (normalizedNext.startsWith("/doctor") && session.role === UserRole.CLINICIAN) ||
    (normalizedNext.startsWith("/research") && researchRoles.includes(session.role))
  ) {
    return normalizedNext;
  }

  return getDefaultPathForRole(session.role);
}