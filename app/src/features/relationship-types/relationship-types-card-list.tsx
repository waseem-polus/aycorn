import { useMemo, useState } from "react";
import { DataTablePagination } from "@/components/data-table-pagination";
import { useNewRelationshipType } from "@/features/relationship-types/hooks/useNewRelationshipType";
import { RelationshipTypeCard } from "@/features/relationship-types/relationship-types-card-list/relationship-type-card";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  data: TaskRelationshipType[];
  isLoading: boolean;
  emptyMessage?: string;
};

const PAGE_SIZE = 10;

export function RelationshipTypesCardList({
  data,
  isLoading,
  emptyMessage = "No relationship types found.",
}: Props) {
  const [pageIndex, setPageIndex] = useState(0);

  const sorted = useMemo(
    () => [...data].sort((a, b) => a.FromName.localeCompare(b.FromName)),
    [data],
  );

  // Jump to the page holding a just-created link so its name can take focus.
  // Adjusted during render (not in an effect) since it only derives from props.
  const { focusId } = useNewRelationshipType();
  const focusIndex =
    focusId === null ? -1 : sorted.findIndex((type) => type.ID === focusId);
  const [pagedToId, setPagedToId] = useState<number | null>(null);
  if (focusIndex >= 0 && pagedToId !== focusId) {
    setPagedToId(focusId);
    setPageIndex(Math.floor(focusIndex / PAGE_SIZE));
  }

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const pageRows = sorted.slice(
    safePageIndex * PAGE_SIZE,
    safePageIndex * PAGE_SIZE + PAGE_SIZE,
  );

  return (
    <div className="flex flex-col gap-2">
      {!isLoading && pageRows.length > 0 ? (
        <div className="flex flex-col gap-2">
          {pageRows.map((type) => (
            <RelationshipTypeCard key={type.ID} type={type} />
          ))}
        </div>
      ) : (
        <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      )}

      <DataTablePagination
        pageIndex={safePageIndex}
        pageCount={pageCount}
        canPreviousPage={safePageIndex > 0}
        canNextPage={safePageIndex < pageCount - 1}
        selectedCount={0}
        totalCount={sorted.length}
        onPreviousPage={() => setPageIndex((i) => Math.max(0, i - 1))}
        onNextPage={() => setPageIndex((i) => Math.min(pageCount - 1, i + 1))}
        hideSelection
      />
    </div>
  );
}
