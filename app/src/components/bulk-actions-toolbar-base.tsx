import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type DeleteConfig = {
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
};

type Props = {
  count: number;
  onClear: () => void;
  children?: ReactNode;
  delete?: DeleteConfig;
  className?: string;
};

export function BulkActionsToolbarBase({
  count,
  onClear,
  children,
  delete: deleteConfig,
  className,
}: Props) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            key="bulk-actions-toolbar"
            data-keep-selection=""
            initial={{ opacity: 0, x: "-50%", y: 120 }}
            animate={{ opacity: 1, x: "-50%", y: 0 }}
            exit={{ opacity: 0, x: "-50%", y: 120 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed bottom-16 left-1/2 z-50 flex items-stretch gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-lg max-w-[calc(100vw-2rem)]",
              className,
            )}
          >
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sm font-medium px-2 whitespace-nowrap">
                {count} selected
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClear}
                aria-label="Clear selection"
              >
                <X />
              </Button>
            </div>

            {children && (
              <>
                <Separator
                  orientation="vertical"
                  className="!h-auto shrink-0"
                />
                <div className="flex items-center gap-1 shrink-0">
                  {children}
                </div>
              </>
            )}

            {deleteConfig && (
              <>
                <Separator
                  orientation="vertical"
                  className="!h-auto shrink-0"
                />
                <div className="flex items-center shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteOpen(true)}
                    disabled={deleteConfig.busy}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {deleteConfig && (
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteConfig.title}</AlertDialogTitle>
              {deleteConfig.description && (
                <AlertDialogDescription>
                  {deleteConfig.description}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  deleteConfig.onConfirm();
                  setDeleteOpen(false);
                }}
                disabled={deleteConfig.busy}
              >
                {deleteConfig.confirmLabel ?? "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
