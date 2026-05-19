import {
  Page,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page/Page";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyPanel } from "@/features/settings/empty-panel";
import { PreferencesPanel } from "@/features/settings/preferences-panel";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageHeader breadcrumb={["Settings"]} />
      <PageContent>
        <PageTitle
          title="Settings"
          description="Manage your preferences, AI behavior, and notifications."
        />

        <Tabs defaultValue="preferences" className="flex-1 min-h-0">
          <TabsList>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="ai">Aycorn AI</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <Separator />

          <TabsContent value="preferences" className="pt-4">
            <PreferencesPanel />
          </TabsContent>

          <TabsContent value="ai" className="pt-4">
            <EmptyPanel
              title="Aycorn AI"
              description="Configure how Aycorn AI assists you across the app."
            />
          </TabsContent>

          <TabsContent value="notifications" className="pt-4">
            <EmptyPanel
              title="Notifications"
              description="Decide which events Aycorn should alert you about."
            />
          </TabsContent>
        </Tabs>
      </PageContent>
    </Page>
  );
}
