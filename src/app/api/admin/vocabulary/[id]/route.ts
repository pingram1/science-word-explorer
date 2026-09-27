import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireAdmin,
} from "@/lib/auth/api-helpers";
import {
  deleteVocabularyWord,
  getVocabularyWord,
  updateVocabularyWord,
} from "@/lib/services/content-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const word = await getVocabularyWord(id);

    if (!word) {
      return jsonError("Vocabulary word not found.", 404);
    }

    return jsonOk({ word });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const word = await updateVocabularyWord(id, body);
    return jsonOk({ word });
  } catch (error) {
    if (error instanceof Error && error.message === "Vocabulary word not found.") {
      return jsonError(error.message, 404);
    }
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const result = await deleteVocabularyWord(id);
    return jsonOk({ deleted: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "Vocabulary word not found.") {
      return jsonError(error.message, 404);
    }
    return handleRouteError(error);
  }
}
