import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDownIcon,
  GripVerticalIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { OptionCommandList } from "@/components/ui/option-command-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import {
  MAX_SORT_RULES,
  SORT_LABELS,
  viewSortOptions,
} from "@/features/views/view-sorts";
import type {
  BoardView,
  SortDirection,
  SortKey,
  SortRule,
} from "@/features/views/view-types";
import { cn } from "@/lib/utils";

type Props = {
  view: BoardView;
  board: Board;
  /** Called with the whole rule list after every change; the caller saves it. */
  onChange: (rules: SortRule[]) => void;
};

/**
 * Edits a view's sort: an ordered list of property + direction rules. Opened
 * with no rules it's just the property list — picking one adds the first rule
 * and the editor takes over. Clearing every rule keeps the editor, with an
 * empty message, so an open popover doesn't change shape. It sizes itself, so
 * its container should be `w-auto p-0`. Rows reorder by drag or keyboard (focus the grip, Space, arrows, Space). Every
 * change saves at once — there's no Save button. A local copy keeps a
 * reorder in place while the save is in flight.
 */
export function SortEditor({ view, board, onChange }: Props) {
  const [rules, setRules] = useState(view.Sort);
  // Re-seed when the server's copy (or the view) changes — during render, not in an effect.
  const serverKey = `${view.ID}:${JSON.stringify(view.Sort)}`;
  const [seededKey, setSeededKey] = useState(serverKey);
  if (seededKey !== serverKey) {
    setSeededKey(serverKey);
    setRules(view.Sort);
  }

  // Only a sort that's empty when the editor mounts shows the bare property list.
  const [bare, setBare] = useState(view.Sort.length === 0);

  const change = (next: SortRule[]) => {
    if (next.length > 0) setBare(false);
    setRules(next);
    onChange(next);
  };

  const options = viewSortOptions(board);
  const used = new Set(rules.map((r) => r.property));
  const unused = options.filter((key) => !used.has(key));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = rules.findIndex((r) => r.property === active.id);
    const to = rules.findIndex((r) => r.property === over.id);
    if (from < 0 || to < 0) return;
    change(arrayMove(rules, from, to));
  };

  const clearAll = () => {
    const snapshot = rules;
    change([]);
    toast("Sorts cleared.", {
      action: { label: "Undo", onClick: () => change(snapshot) },
    });
  };

  const addRule = (property: SortKey) =>
    change([...rules, { property, direction: "asc" }]);

  if (rules.length === 0 && bare) {
    return <PropertyList options={unused} onPick={addRule} className="w-56" />;
  }

  return (
    <div className="flex w-[26rem] max-w-[calc(100vw-2rem)] flex-col gap-2 p-4">
      {rules.length === 0 && (
        <div className="rounded-md border border-dashed py-3 text-center text-sm text-muted-foreground">
          No sorts. Tasks keep their default order.
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={rules.map((r) => r.property)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {rules.map((rule, i) => (
              <SortRuleRow
                key={rule.property}
                rule={rule}
                options={[rule.property, ...unused]}
                onChange={(next) =>
                  change(rules.map((r, j) => (j === i ? next : r)))
                }
                onRemove={() => change(rules.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex items-center justify-between gap-2">
        <PropertyPicker options={unused} onPick={addRule}>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={unused.length === 0 || rules.length >= MAX_SORT_RULES}
          >
            <PlusIcon />
            Add sort
          </Button>
        </PropertyPicker>
        {rules.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={clearAll}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}

function SortRuleRow({
  rule,
  options,
  onChange,
  onRemove,
}: {
  rule: SortRule;
  /** This rule's property and the ones no other rule uses. */
  options: SortKey[];
  onChange: (rule: SortRule) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.property });

  return (
    <div
      ref={setNodeRef}
      data-task-card=""
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1.5 rounded-md bg-popover",
        isDragging && "z-10 opacity-80 shadow",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        data-drag-handle=""
        style={{ touchAction: "none" }}
        className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing"
        aria-label={`Reorder ${SORT_LABELS[rule.property]} sort`}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-4" />
      </button>

      <PropertyPicker
        options={options}
        selected={rule.property}
        onPick={(property) => onChange({ ...rule, property })}
      >
        <Button
          variant="outline"
          size="sm"
          className="min-w-0 flex-1 justify-between font-normal"
        >
          <span className="truncate">{SORT_LABELS[rule.property]}</span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </PropertyPicker>

      <Select
        value={rule.direction}
        onValueChange={(direction) =>
          onChange({ ...rule, direction: direction as SortDirection })
        }
      >
        <SelectTrigger size="sm" className="w-32" aria-label="Sort direction">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Ascending</SelectItem>
          <SelectItem value="desc">Descending</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground"
        aria-label={`Remove ${SORT_LABELS[rule.property]} sort`}
        onClick={onRemove}
      >
        <XIcon />
      </Button>
    </div>
  );
}

function PropertyPicker({
  options,
  selected,
  onPick,
  children,
}: {
  options: SortKey[];
  selected?: SortKey;
  onPick: (property: SortKey) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <PropertyList
          options={options}
          selected={selected}
          onPick={(property) => {
            onPick(property);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** The searchable list of sort properties, shown alone for an empty sort or inside a picker. */
function PropertyList({
  options,
  selected,
  onPick,
  className,
}: {
  options: SortKey[];
  selected?: SortKey;
  onPick: (property: SortKey) => void;
  className?: string;
}) {
  return (
    <OptionCommandList
      options={options.map((key) => ({ key, label: SORT_LABELS[key] }))}
      selected={selected ? [selected] : []}
      searchPlaceholder="Sort by…"
      onSelect={(key) => onPick(key as SortKey)}
      className={className}
    />
  );
}
