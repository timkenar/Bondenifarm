/**
 * Normalize an API payload into an array.
 *
 * The backend sometimes returns a bare array and sometimes a DRF paginated
 * object (`{ count, next, previous, results }`). Components that call `.map`,
 * `.find`, `.reduce`, etc. on the response will crash if it isn't an array, so
 * every list fetch should pass its payload through this helper.
 */
export function toArray<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    const results = (data as { results?: unknown })?.results;
    return Array.isArray(results) ? (results as T[]) : [];
}
