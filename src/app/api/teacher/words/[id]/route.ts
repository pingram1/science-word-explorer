import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireTeacherAccess,
} from "@/lib/auth/api-helpers";
import { getWordAnalysis } from "@/lib/teacher/services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireTeacherAccess();
    const { id } = await params;
    const analysis = await getWordAnalysis(id, user);
    if (!analysis) {
      return jsonError("Vocabulary word not found.", 404);
    }
    return jsonOk(analysis);
  } catch (error) {
    return handleRouteError(error);
  }
}
