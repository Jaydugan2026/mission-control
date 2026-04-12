import type { HomepagePayload } from '@/types/dashboard';
import { mockHomeData } from './mockHomeData';

/**
 * getHomeData — single fetch location for the homepage payload.
 *
 * Currently returns mock data. When Mission Control Runtime is wired up,
 * replace this function body only — the return type and call sites stay the same.
 */
export async function getHomeData(): Promise<HomepagePayload> {
  // TODO: Replace with real runtime fetch when runtime is connected
  return {
    ...mockHomeData,
    generatedAt: new Date().toISOString(),
  };
}
