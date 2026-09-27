import { handleRouteError, jsonOk, requireAuth } from "@/lib/auth/api-helpers";
import { buildStudentDashboard } from "@/lib/api/student-services";

export async function GET() {
  try {
    const { user } = await requireAuth(["student"]);
    const dashboard = await buildStudentDashboard(user.id);
    return jsonOk(dashboard);
  } catch (error) {
    return handleRouteError(error);
  }
}
