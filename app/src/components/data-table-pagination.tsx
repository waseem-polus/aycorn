import { Button } from "@/components/ui/button";

type DataTablePaginationProps = {
  pageIndex: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  selectedCount: number;
  totalCount: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function DataTablePagination({
  pageIndex,
  pageCount,
  canPreviousPage,
  canNextPage,
  selectedCount,
  totalCount,
  onPreviousPage,
  onNextPage,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
      <div>
        {selectedCount} of {totalCount} selected
      </div>
      <div className="flex items-center gap-4">
        <span>
          Page {pageIndex + 1} of {Math.max(pageCount, 1)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={!canPreviousPage}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!canNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
