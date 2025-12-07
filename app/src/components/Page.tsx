import { SiteHeader } from "./site-header";

export function Page({
  breadcrumb,
  children,
}: {
  breadcrumb: string[];
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader breadcrumb={breadcrumb} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
