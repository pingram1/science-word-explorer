import { NextResponse } from "next/server";
import { handleRouteError, requireAuth } from "@/lib/auth/api-helpers";
import { getRepository } from "@/lib/repositories";

export async function GET() {
  try {
    await requireAuth(["student", "teacher", "admin"]);
    const repo = await getRepository();
    const units = await repo.listUnits(true);
    return NextResponse.json(units);
  } catch (error) {
    return handleRouteError(error);
  }
}
