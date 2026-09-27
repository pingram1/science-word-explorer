import { handleRouteError, jsonOk, requireAuth } from "@/lib/auth/api-helpers";
import { buildJourneyData } from "@/lib/api/student-services";

export async function GET() {
  try {
    const { user } = await requireAuth(["student"]);
    const data = await buildJourneyData(user.id);
    return jsonOk(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
