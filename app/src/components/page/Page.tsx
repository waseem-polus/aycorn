import { Toaster } from "../ui/sonner";
import { PageHeader } from "./PageHeader";

export function Page({
  breadcrumb,
  children,
  fullWidth = false,
}: {
  breadcrumb: string[];
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="flex flex-col h-svh overflow-hidden">
      <PageHeader breadcrumb={breadcrumb} />
      <div className="flex flex-1 flex-col grow overflow-hidden">
        <div className="@container/main flex flex-1 flex-col gap-2 items-center overflow-hidden">
          <div
            className={`flex flex-col gap-4 p-4 md:gap-6 md:py-6 w-full overflow-hidden ${fullWidth ? "" : "max-w-7xl"}`}
          >
            {children}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
