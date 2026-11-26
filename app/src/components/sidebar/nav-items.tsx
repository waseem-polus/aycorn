import type { ReactElement } from "react";
import {
  CalendarClockIcon,
  ChartAreaIcon,
  FolderIcon,
  FunnelIcon,
  LinkIcon,
  SettingsIcon,
  TagsIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type NavItem = {
  title: string;
  url: "/" | "/upcoming" | "/filters" | "/workflows" | "/task-types" | "/task-links" | "/usage" | "/settings";
  icon: LucideIcon;
  badge?: ReactElement;
};

/**
 * Aycorn's built-in pages. The sidebar renders them and the command palette
 * turns each into a "Go to …" command, so a new page added here shows up in both.
 */
export const navMain: NavItem[] = [
  { title: "Projects", url: "/", icon: FolderIcon },
  { title: "Upcoming", url: "/upcoming", icon: CalendarClockIcon },
  {
    title: "Saved filters",
    url: "/filters",
    icon: FunnelIcon,
    badge: <Badge className="text-xs py-0.5 -rotate-2">New!</Badge>,
  },
];

export const navConfigure: NavItem[] = [
  { title: "Workflows", url: "/workflows", icon: WorkflowIcon },
  { title: "Task Types", url: "/task-types", icon: TagsIcon },
  { title: "Task Links", url: "/task-links", icon: LinkIcon },
];

export const navSecondary: NavItem[] = [
  { title: "Usage", url: "/usage", icon: ChartAreaIcon },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];
