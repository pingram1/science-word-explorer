import { seedDatabase } from "@/lib/seed";
import { jsonOk, jsonError, handleRouteError } from "@/lib/auth/api-helpers";

export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return jsonError("Seeding is only available in development or demo mode.", 403);
  }

  try {
    const store = await seedDatabase();
    return jsonOk({
      seeded: true,
      seedVersion: store.metadata.seedVersion,
      userCount: store.users.length,
      wordCount: store.vocabularyWords.length,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
