import { handleRouteError, jsonError, jsonOk, requireAuth } from "@/lib/auth/api-helpers";
import { buildUnitDetail } from "@/lib/api/student-services";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { user } = await requireAuth(["student"]);
    const { slug } = await params;
    const data = await buildUnitDetail(user.id, slug);

    if (!data) {
      return jsonError("Unit not found.", 404);
    }

    return jsonOk(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
