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
    <>
      <PageHeader breadcrumb={breadcrumb} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2 items-center">
          <div
            className={`flex flex-col gap-4 p-4 md:gap-6 md:py-6 w-full ${fullWidth ? "" : "max-w-6xl"}`}
          >
            {children}
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
