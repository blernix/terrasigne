import { NextResponse } from "next/server";
import { verifyConfirmationToken } from "@/lib/newsletter";
import { addContactToList } from "@/lib/brevo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const data = token ? verifyConfirmationToken(token) : null;
  const redirect = new URL("/newsletter-confirmation", url.origin);

  if (!data) {
    redirect.searchParams.set("status", "error");
    return NextResponse.redirect(redirect);
  }

  try {
    await addContactToList({
      email: data.email,
      listIds: data.listIds,
      attributes: { NEWSLETTER_CONSENT: new Date().toISOString() },
    });
  } catch (e) {
    console.error("Erreur confirmation newsletter :", e);
    redirect.searchParams.set("status", "error");
    return NextResponse.redirect(redirect);
  }

  redirect.searchParams.set("status", "ok");
  return NextResponse.redirect(redirect);
}
