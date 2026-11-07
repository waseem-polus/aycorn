import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APP_SETTINGS_KEY } from "@/features/settings/queries/useAppSettingsQuery";
import type { AppSettings } from "@/features/settings/settings-types";

export function useAppSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AppSettings) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as AppSettings;
    },
    onSuccess: (saved) => queryClient.setQueryData(APP_SETTINGS_KEY, saved),
  });
}
