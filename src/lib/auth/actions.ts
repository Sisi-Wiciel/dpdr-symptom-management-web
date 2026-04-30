"use server";

import { redirect } from "next/navigation";

import { authenticateWithPassword, clearViewerSession, createViewerSession, getSafeDestination } from "@/lib/auth/server";

function buildSignInFailureUrl(error: "missing" | "invalid", nextPath: string | null) {
  const params = new URLSearchParams({ error });

  if (nextPath) {
    params.set("next", nextPath);
  }

  return `/signin?${params.toString()}`;
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("next") ?? "").trim() || null;

  if (!email || !password) {
    redirect(buildSignInFailureUrl("missing", nextPath));
  }

  const user = await authenticateWithPassword(email, password);

  if (!user) {
    redirect(buildSignInFailureUrl("invalid", nextPath));
  }

  await createViewerSession(user);

  redirect(
    getSafeDestination(
      {
        sub: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.primaryRole,
      },
      nextPath,
    ),
  );
}

export async function signOutAction() {
  await clearViewerSession();
  redirect("/signin");
}