import { handleRouteError, jsonOk, requireTeacherAccess } from "@/lib/auth/api-helpers";
import { getTeacherDashboard } from "@/lib/teacher/services";
import type { TeacherDashboardFilters } from "@/lib/teacher/types";
import type { SkillCategory, WordMasteryStatus } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const user = await requireTeacherAccess();

    const url = new URL(request.url);
    const filters: TeacherDashboardFilters = {
      classId: url.searchParams.get("classId") ?? undefined,
      unitId: url.searchParams.get("unitId") ?? undefined,
      studentId: url.searchParams.get("studentId") ?? undefined,
      startDate: url.searchParams.get("startDate") ?? undefined,
      endDate: url.searchParams.get("endDate") ?? undefined,
      masteryStatus:
        (url.searchParams.get("masteryStatus") as WordMasteryStatus | null) ?? undefined,
      skillCategory:
        (url.searchParams.get("skillCategory") as SkillCategory | null) ?? undefined,
    };

    const dashboard = await getTeacherDashboard(filters, user);
    return jsonOk(dashboard);
  } catch (error) {
    return handleRouteError(error);
  }
}
