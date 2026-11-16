import {
  OptionCommandList,
} from "@/components/ui/option-command-list";
import type { MultiSelectOption } from "@/components/ui/multi-select-combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_GROUP_KEYS,
  GRANULARITIES,
  GROUP_LABELS,
  viewGroupings,
} from "@/features/views/view-groupings";
import type { Board } from "@/features/saved-filters/saved-filter-types";
import type {
  BoardView,
  Granularity,
  GroupByKey,
  ViewPatch,
} from "@/features/views/view-types";

const NO_GROUPING = "__none";

type Props = {
  view: BoardView;
  board: Board;
  onUpdate: (patch: ViewPatch) => void;
  /** Called after a grouping is picked, to close the flyout. */
  onPicked: () => void;
};

/**
 * The Group by flyout: a searchable pick of the groupings this layout offers
 * on this board, plus a date granularity for date-grouped lists.
 */
export function GroupByFlyout({ view, board, onUpdate, onPicked }: Props) {
  const groupings = viewGroupings(view.Type, board);
  const isDateGroup =
    view.GroupBy !== null && DATE_GROUP_KEYS.includes(view.GroupBy);

  const options: MultiSelectOption[] = [
    ...(groupings.optional ? [{ key: NO_GROUPING, label: "No grouping" }] : []),
    ...groupings.options.map((key) => ({ key, label: GROUP_LABELS[key] })),
  ];

  return (
    <div className="flex flex-col">
      <OptionCommandList
        options={options}
        selected={[view.GroupBy ?? NO_GROUPING]}
        searchPlaceholder="Group by…"
        onSelect={(key) => {
          onUpdate({
            groupBy: key === NO_GROUPING ? null : (key as GroupByKey),
          });
          onPicked();
        }}
      />
      {view.Type === "list" && isDateGroup && (
        <div className="border-t p-2">
          <Select
            value={view.GroupOptions.granularity ?? "week"}
            onValueChange={(granularity) =>
              onUpdate({
                groupOptions: {
                  ...view.GroupOptions,
                  granularity: granularity as Granularity,
                },
              })
            }
          >
            <SelectTrigger className="w-full" aria-label="Date granularity">
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
        </div>
      )}
    </div>
  );
}
