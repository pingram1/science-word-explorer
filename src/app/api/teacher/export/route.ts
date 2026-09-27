import {
  handleRouteError,
  jsonError,
  requireTeacherAccess,
} from "@/lib/auth/api-helpers";
import { exportCsv, type ExportType } from "@/lib/services/teacher-service";

const VALID_TYPES: ExportType[] = ["class", "student", "word", "events"];

export async function GET(request: Request) {
  try {
    const user = await requireTeacherAccess();
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "class") as ExportType;

    if (!VALID_TYPES.includes(type)) {
      return jsonError(`Invalid export type. Use one of: ${VALID_TYPES.join(", ")}.`, 400);
    }

    const { filename, content } = await exportCsv(user.id, type);

    return new Response(content, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
