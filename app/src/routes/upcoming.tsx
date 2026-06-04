import { createFileRoute } from "@tanstack/react-router";
import { UpcomingPage } from "@/features/upcoming/upcoming-page";

export const Route = createFileRoute("/upcoming")({
  component: UpcomingPage,
});
