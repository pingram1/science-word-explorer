import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireStudentAccess,
} from "@/lib/auth/api-helpers";
import {
  completeStep,
  exitAndSaveSession,
  getActiveSupportsForSession,
  resumeSession,
} from "@/lib/services/learning-service";
import { getRepository } from "@/lib/repositories";
import type { InstructionalStep } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const repo = await getRepository();
    const session = await repo.getLearningSession(id);

    if (!session) {
      return jsonError("Session not found.", 404);
    }

    await requireStudentAccess(session.studentId);
    const supports = await getActiveSupportsForSession(session);

    return jsonOk({ session, supports });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const repo = await getRepository();
    const existing = await repo.getLearningSession(id);

    if (!existing) {
      return jsonError("Session not found.", 404);
    }

    await requireStudentAccess(existing.studentId);

    const body = (await request.json()) as {
      action?: "completeStep" | "exit" | "resume";
      step?: InstructionalStep;
    };

    switch (body.action) {
      case "exit": {
        const session = await exitAndSaveSession(id);
        return jsonOk({ session });
      }
      case "resume": {
        const session = await resumeSession(id);
        if (!session) {
          return jsonError("Session is not resumable.", 400);
        }
        return jsonOk({ session });
      }
      case "completeStep":
      default: {
        const session = await completeStep(id, body.step);
        return jsonOk({ session });
      }
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
