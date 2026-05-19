import { toast } from "sonner";
import type { BulkResult } from "@/types/types";

// `lead` is the primary sentence describing what succeeded
// (e.g. "Deleted 3 stages."); skipped/failed counts are appended uniformly.
export function bulkResultToast(result: BulkResult, lead: string) {
  const parts = [lead];
  if (result.skipped > 0) parts.push(`${result.skipped} skipped.`);
  if (result.failed > 0) parts.push(`${result.failed} failed.`);
  toast(parts.join(" "));
}
