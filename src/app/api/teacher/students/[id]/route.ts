import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireTeacherAccess,
} from "@/lib/auth/api-helpers";
import { getStudentDetail } from "@/lib/teacher/services";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await requireTeacherAccess(id);
    const detail = await getStudentDetail(id);
    if (!detail) {
      return jsonError("Student not found.", 404);
    }
    return jsonOk(detail);
  } catch (error) {
    return handleRouteError(error);
  }
}
