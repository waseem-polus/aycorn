import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_APP_SETTINGS,
  type AppSettings,
} from "@/features/settings/settings-types";

export const APP_SETTINGS_KEY = ["appSettings"] as const;

/**
 * The app-wide preferences. They change rarely, so they stay cached for the
 * session; `settings` falls back to the defaults while loading.
 */
export function useAppSettingsQuery() {
  const query = useQuery<AppSettings>({
    queryKey: APP_SETTINGS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    staleTime: Infinity,
  });

  return { ...query, settings: query.data ?? DEFAULT_APP_SETTINGS };
}
