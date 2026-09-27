import { handleRouteError, jsonOk, requireAuth } from "@/lib/auth/api-helpers";
import { buildUnitCards } from "@/lib/api/student-services";

export async function GET() {
  try {
    const { user } = await requireAuth(["student"]);
    const units = await buildUnitCards(user.id);
    return jsonOk({ units });
  } catch (error) {
    return handleRouteError(error);
  }
}
