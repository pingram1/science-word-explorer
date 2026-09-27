import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireStudentAccess,
} from "@/lib/auth/api-helpers";
import { recordAttemptAndEvent, type RecordAttemptInput } from "@/lib/services/learning-service";
import { getRepository } from "@/lib/repositories";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const repo = await getRepository();
    const session = await repo.getLearningSession(id);

    if (!session) {
      return jsonError("Session not found.", 404);
    }

    await requireStudentAccess(session.studentId);

    const body = (await request.json()) as Omit<RecordAttemptInput, "sessionId">;
    if (body.instructionalStep === undefined) {
      return jsonError("instructionalStep is required.", 400);
    }

    const result = await recordAttemptAndEvent({
      sessionId: id,
      ...body,
    });

    return jsonOk(result, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
