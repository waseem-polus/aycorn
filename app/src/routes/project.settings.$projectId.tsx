import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyPanel } from "@/features/settings/empty-panel";
import { createFileRoute } from "@tanstack/react-router";
import { LandPlotIcon, TagIcon, WorkflowIcon } from "lucide-react";

export const Route = createFileRoute("/project/settings/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Project", "Settings"]} />
      <PageContent>
        <PageTitle
          title="Project Settings"
          description="Manage your project's behavior and settings."
        />

        <Tabs defaultValue="workflow" className="flex-1 min-h-0">
          <TabsList>
            <TabsTrigger value="workflow">
              <WorkflowIcon />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="checklists">
              <LandPlotIcon />
              Checklists
            </TabsTrigger>
            <TabsTrigger value="tags">
              <TagIcon />
              Tags
            </TabsTrigger>
          </TabsList>

          <Separator />

          <TabsContent value="workflow">
            <EmptyPanel
              title="Workflow"
              description="Tasks in this project move through the stages defined by this workflow. Switching workflows requires routing every task to a new stage."
            />
          </TabsContent>

          <TabsContent value="checklists">
            <EmptyPanel
              title="Checklists"
              description="Group tasks by phase, sprint, or area. The default checklist is picked automatically when a teammate creates a new task without choosing one."
            />
          </TabsContent>

          <TabsContent value="tags">
            <EmptyPanel
              title="Tags"
              description="Lightweight labels for tasks. Use them to mark type, area of code, or anything that doesn't fit a stage or checklist."
            />
          </TabsContent>
        </Tabs>
      </PageContent>
    </Page>
  );
}
