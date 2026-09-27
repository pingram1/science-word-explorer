import { promises as fs } from "fs";
import path from "path";
import type { DataStore } from "@/lib/repositories/types";
import { createEmptyDataStore } from "@/lib/repositories/types";
import { Mutex } from "@/lib/utils/mutex";

const DATA_DIR = path.join(process.cwd(), ".data");
export const STORE_FILE_PATH = path.join(DATA_DIR, "store.json");

let cachedStore: DataStore | null = null;
let cachedMtimeMs = 0;
const storeMutex = new Mutex();

export function getCachedStore(): DataStore | null {
  return cachedStore;
}

export function setCachedStore(store: DataStore): void {
  cachedStore = store;
}

export function clearCachedStore(): void {
  cachedStore = null;
  cachedMtimeMs = 0;
}

export async function storeFileExists(): Promise<boolean> {
  try {
    await fs.access(STORE_FILE_PATH);
    return true;
  } catch {
    return false;
  }
}

export async function loadStoreFromDisk(): Promise<DataStore> {
  try {
    const stat = await fs.stat(STORE_FILE_PATH);
    // Reload when another Next.js worker wrote the file so sessions are not 404'd.
    if (cachedStore && cachedMtimeMs === stat.mtimeMs) {
      return cachedStore;
    }
    const raw = await fs.readFile(STORE_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as DataStore;
    cachedStore = parsed;
    cachedMtimeMs = stat.mtimeMs;
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      const empty = createEmptyDataStore();
      cachedStore = empty;
      cachedMtimeMs = 0;
      return empty;
    }
    throw error;
  }
}

export async function saveStoreToDisk(store: DataStore): Promise<void> {
  await storeMutex.run(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // Unique temp path so overlapping saves cannot unlink each other's tmp file.
    const tempPath = `${STORE_FILE_PATH}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(store, null, 2), "utf-8");
    await fs.rename(tempPath, STORE_FILE_PATH);
    const stat = await fs.stat(STORE_FILE_PATH);
    cachedStore = store;
    cachedMtimeMs = stat.mtimeMs;
  });
}

export async function deleteStoreFile(): Promise<void> {
  clearCachedStore();
  try {
    await fs.unlink(STORE_FILE_PATH);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
