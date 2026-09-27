import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireAuth,
  buildAccessContext,
} from "@/lib/auth/api-helpers";
import { startSession } from "@/lib/services/learning-service";
import { getRepository } from "@/lib/repositories";

export async function GET() {
  try {
    const { user } = await requireAuth(["student", "teacher", "admin"]);
    const repo = await getRepository();

    if (user.role === "student") {
      const sessions = await repo.listLearningSessions({ studentId: user.id });
      return jsonOk({ sessions });
    }

    if (user.role === "admin") {
      const sessions = await repo.listLearningSessions();
      return jsonOk({ sessions });
    }

    const context = await buildAccessContext(user);
    const teacherClassIds = new Set(
      context.classMemberships
        .filter((membership) => membership.userId === user.id && membership.role === "teacher")
        .map((membership) => membership.classId),
    );
    const allowedStudentIds = new Set(
      context.classMemberships
        .filter(
          (membership) =>
            membership.role === "student" && teacherClassIds.has(membership.classId),
        )
        .map((membership) => membership.userId),
    );

    const sessions = (await repo.listLearningSessions()).filter((session) =>
      allowedStudentIds.has(session.studentId),
    );

    return jsonOk({ sessions });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user } = await requireAuth(["student"]);
    const body = (await request.json()) as {
      vocabularyWordId?: string;
      unitId?: string;
      classId?: string | null;
      assignmentId?: string | null;
      supportLevel?: 1 | 2 | 3 | 4;
      deviceCategory?: "desktop" | "tablet" | "chromebook" | "interactive_display" | "unknown";
    };

    if (!body.vocabularyWordId || !body.unitId) {
      return jsonError("vocabularyWordId and unitId are required.", 400);
    }

    const session = await startSession({
      studentId: user.id,
      vocabularyWordId: body.vocabularyWordId,
      unitId: body.unitId,
      classId: body.classId,
      assignmentId: body.assignmentId,
      supportLevel: body.supportLevel,
      deviceCategory: body.deviceCategory,
    });

    return jsonOk({ session }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
