/**
 * Chains async work so overlapping writes cannot clobber each other.
 * Used to serialize per-session grading and local-store mutations.
 */
export class Mutex {
  private queue: Promise<void> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const run = this.queue.then(task, task);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}
