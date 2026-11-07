import { useState } from "react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { CopyIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toDefinition } from "@/features/saved-filters/filter-definition";
import { IconColorPicker } from "@/features/icon-picker/icon-color-picker";
import { ConditionBuilder } from "@/features/task-filters/conditions/condition-builder";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { useConditionTree } from "@/features/task-filters/conditions/hooks/useConditionTree";
import type { BoardViewsAPI } from "@/features/views/hooks/useBoardViews";
import { useDebouncedSourceSave } from "@/features/views/hooks/useDebouncedSourceSave";
import {
  DATE_GROUP_KEYS,
  GRANULARITIES,
  GROUP_LABELS,
  viewGroupings,
  VIEW_TYPES,
} from "@/features/views/view-groupings";
import type {
  BoardView,
  Granularity,
  GroupByKey,
  ViewType,
} from "@/features/views/view-types";

const NO_GROUPING = "__none";

type Props = {
  view: BoardView;
  api: BoardViewsAPI;
  sources: ConditionOptionSources;
  /** Focus and select the name first — a just-created view. */
  focusName: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
};

/**
 * A view's settings, as the content of its tab's popover: name and icon,
 * layout, grouping, and data source. Everything auto-saves — text on blur,
 * choices on change, the data source shortly after the last edit.
 */
export function ViewSettingsPopover({
  view,
  api,
  sources,
  focusName,
  onDuplicate,
  onDelete,
}: Props) {
  const [name, setName] = useState(view.Name);
  const source = useDebouncedSourceSave(view, (root) =>
    void api.update(view.ID, { source: toDefinition(root) }),
  );
  const tree = useConditionTree(source.root, source.update);
  const groupings = viewGroupings(view.Type, api.board);
  const isDateGroup = view.GroupBy !== null && DATE_GROUP_KEYS.includes(view.GroupBy);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) return setName(view.Name);
    if (trimmed !== view.Name) void api.update(view.ID, { name: trimmed });
  };

  return (
    <PopoverContent
      align="start"
      className="flex w-[36rem] max-w-[calc(100vw-2rem)] max-h-[75vh] flex-col gap-5 overflow-y-auto"
      // Clicking a toast (e.g. Undo after clearing conditions) isn't a
      // click away from the settings.
      onInteractOutside={(e) => {
        if ((e.target as Element | null)?.closest("[data-sonner-toaster]")) {
          e.preventDefault();
        }
      }}
      onOpenAutoFocus={(e) => {
        if (!focusName) e.preventDefault();
      }}
    >
      <div className="flex items-center gap-1">
        <IconColorPicker
          iconValue={view.Icon}
          colorValue={view.Color}
          onIconSelect={(icon) => void api.update(view.ID, { icon })}
          onColorSelect={(color) => void api.update(view.ID, { color })}
        />
        <Input
          autoFocus={focusName}
          onFocus={(e) => focusName && e.currentTarget.select()}
          value={name}
          aria-label="View name"
          className="h-8 border-transparent px-1.5 text-base font-medium shadow-none hover:border-input focus-visible:border-input"
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setName(view.Name);
          }}
        />
      </div>

      <section className="flex flex-col gap-2">
        <span className="text-sm text-muted-foreground">Layout</span>
        <ToggleGroup
          type="single"
          variant="outline"
          value={view.Type}
          onValueChange={(type) => type && void api.update(view.ID, { type: type as ViewType })}
          className="w-full"
        >
          {VIEW_TYPES.map((t) => (
            <ToggleGroupItem key={t.type} value={t.type} className="flex-1 gap-1.5">
              <DynamicIcon name={t.icon as IconName} className="size-4" />
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      {(groupings.options.length > 0 || view.GroupBy) && (
        <section className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Group by</span>
          <div className="flex gap-2">
            <Select
              value={view.GroupBy ?? NO_GROUPING}
              onValueChange={(key) =>
                void api.update(view.ID, {
                  groupBy: key === NO_GROUPING ? null : (key as GroupByKey),
                })
              }
            >
              <SelectTrigger className="flex-1" aria-label="Group by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groupings.optional && <SelectItem value={NO_GROUPING}>No grouping</SelectItem>}
                {groupings.options.map((key) => (
                  <SelectItem key={key} value={key}>
                    {GROUP_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {view.Type === "list" && isDateGroup && (
              <Select
                value={view.GroupOptions.granularity ?? "week"}
                onValueChange={(granularity) =>
                  void api.update(view.ID, {
                    groupOptions: { ...view.GroupOptions, granularity: granularity as Granularity },
                  })
                }
              >
                <SelectTrigger className="w-32" aria-label="Date granularity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRANULARITIES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      By {g.label.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Data source</span>
          <span className="text-xs text-muted-foreground">
            Which tasks this view shows. Quick filters narrow it further.
          </span>
        </div>
        <ConditionBuilder tree={tree} sources={sources} />
      </section>

      <div className="flex gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          <CopyIcon />
          Duplicate
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto text-destructive"
          disabled={api.views.length <= 1}
          onClick={onDelete}
        >
          <Trash2Icon />
          Delete view
        </Button>
      </div>
    </PopoverContent>
  );
}
