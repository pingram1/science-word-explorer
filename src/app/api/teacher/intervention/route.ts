import { type NextRequest } from "next/server";
import {
  handleRouteError,
  jsonError,
  jsonOk,
  requireTeacherAccess,
  requireTeacherClassAccess,
} from "@/lib/auth/api-helpers";
import { getRepository } from "@/lib/repositories";
import { getInterventionPageData } from "@/lib/teacher/services";
import { generateId } from "@/lib/utils/id";
import type { InterventionGroup, SkillCategory } from "@/lib/types";
import { SEED_IDS } from "@/lib/seed/seed-ids";

export async function GET(request: NextRequest) {
  try {
    const user = await requireTeacherAccess();
    const classId = request.nextUrl.searchParams.get("classId") ?? undefined;
    if (classId) {
      await requireTeacherClassAccess(classId);
    }
    const data = await getInterventionPageData(classId, user);
    return jsonOk(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireTeacherAccess();
    const body = await request.json();
    const classId = (body.classId as string | undefined) ?? SEED_IDS.class.riveraPeriod3;
    await requireTeacherClassAccess(classId);

    const repo = await getRepository();
    const now = new Date().toISOString();

    const group: InterventionGroup = {
      id: generateId(),
      classId,
      name: body.name,
      reason: body.reason,
      supportingData: body.supportingData ?? "",
      recommendedActivity: body.recommendedActivity ?? "",
      status: "active",
      isManual: true,
      skillFocus: (body.skillFocus as SkillCategory) ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const created = await repo.createInterventionGroup(group);

    if (Array.isArray(body.studentIds)) {
      for (const studentId of body.studentIds as string[]) {
        await repo.addInterventionGroupMember({
          id: generateId(),
          groupId: created.id,
          studentId,
          addedAt: now,
        });
      }
    }

    return jsonOk(created, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireTeacherAccess();
    const body = await request.json();
    const repo = await getRepository();

    if (!body.id) {
      return jsonError("Group id is required", 400);
    }

    const group = await repo.getInterventionGroup(body.id);
    if (!group) {
      return jsonError("Intervention group not found.", 404);
    }
    await requireTeacherClassAccess(group.classId);

    const updated = await repo.updateInterventionGroup(body.id, {
      name: body.name,
      reason: body.reason,
      supportingData: body.supportingData,
      recommendedActivity: body.recommendedActivity,
      status: body.status,
      skillFocus: body.skillFocus,
      updatedAt: new Date().toISOString(),
    });

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
