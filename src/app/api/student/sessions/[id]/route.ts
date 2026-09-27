import { handleRouteError, jsonError, jsonOk, requireAuth } from "@/lib/auth/api-helpers";
import { buildSessionPayload } from "@/lib/api/student-services";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await requireAuth(["student"]);
    const { id } = await params;
    const payload = await buildSessionPayload(id, user.id);

    if (!payload) {
      return jsonError("Session not found.", 404);
    }

    return jsonOk(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
