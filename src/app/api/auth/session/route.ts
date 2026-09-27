import { NextResponse } from "next/server";
import { getSession, getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: true, data: { session: null, user: null } });
  }

  const user = await getSessionUser();
  return NextResponse.json({ ok: true, data: { session, user } });
}
