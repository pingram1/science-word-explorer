import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireAdmin,
} from "@/lib/auth/api-helpers";
import { createVocabularyWord, listVocabulary } from "@/lib/services/content-service";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get("unitId") ?? undefined;
    const words = await listVocabulary(unitId);
    return jsonOk({ words });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const word = await createVocabularyWord(body);
    return jsonOk({ word }, 201);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return jsonError("Validation failed.", 422);
    }
    return handleRouteError(error);
  }
}
