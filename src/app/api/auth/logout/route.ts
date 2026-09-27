import { clearSession } from "@/lib/auth/session";
import { jsonOk, handleRouteError } from "@/lib/auth/api-helpers";

export async function POST() {
  try {
    await clearSession();
    return jsonOk({ loggedOut: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
