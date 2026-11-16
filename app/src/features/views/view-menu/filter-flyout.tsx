import { toDefinition } from "@/features/saved-filters/filter-definition";
import { ConditionBuilder } from "@/features/task-filters/conditions/condition-builder";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { useConditionTree } from "@/features/task-filters/conditions/hooks/useConditionTree";
import { useDebouncedSourceSave } from "@/features/views/hooks/useDebouncedSourceSave";
import type { BoardView, ViewPatch } from "@/features/views/view-types";

type Props = {
  view: BoardView;
  sources: ConditionOptionSources;
  onUpdate: (patch: ViewPatch) => void;
};

/**
 * The Filter flyout: the view's data-source condition tree. Mounts when the
 * flyout opens and saves what's pending when it closes (see
 * `useDebouncedSourceSave`); edits save shortly after the last change.
 */
export function FilterFlyout({ view, sources, onUpdate }: Props) {
  const source = useDebouncedSourceSave(view, (root) =>
    onUpdate({ source: toDefinition(root) }),
  );
  const tree = useConditionTree(source.root, source.update);

  return <ConditionBuilder tree={tree} sources={sources} />;
}
