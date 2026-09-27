import type { Repository } from "@/lib/repositories/types";
import { LocalRepository } from "@/lib/repositories/local-repository";
import { seedDatabase } from "@/lib/seed";

let repositoryInstance: Repository | null = null;

function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Returns the active repository implementation.
 * Uses local file-backed storage when Supabase env vars are absent.
 */
export async function getRepository(): Promise<Repository> {
  if (repositoryInstance) {
    return repositoryInstance;
  }

  if (hasSupabaseConfig()) {
    // Supabase repository will be wired in when credentials are configured.
    // Fall back to local mode so the app remains functional during development.
    console.warn(
      "[Science Word Explorer] Supabase env vars detected but Supabase repository is not yet implemented. Using local store.",
    );
  }

  await seedDatabase();
  const localRepository = new LocalRepository();
  await localRepository.load();
  repositoryInstance = localRepository;
  return repositoryInstance;
}

export function resetRepositoryForTests(): void {
  repositoryInstance = null;
}

export { LocalRepository } from "@/lib/repositories/local-repository";
export type { DataStore, Repository } from "@/lib/repositories/types";
