import { OptionCommandList } from "@/components/ui/option-command-list";
import type { ConditionOptionSources } from "@/features/task-filters/conditions/condition-builder-context";
import { PropertyIcon } from "@/features/task-filters/conditions/condition-builder/property-icon";
import {
  linkPropertyKeys,
  PROPERTY_SECTIONS,
  resolveProperty,
  STATIC_PROPERTIES,
  STATIC_PROPERTY_KEYS,
} from "@/features/task-filters/conditions/condition-properties";
import type { PropertyKey } from "@/features/task-filters/conditions/condition-types";
import type { TaskRelationshipType } from "@/types/types";

type Props = {
  sources: ConditionOptionSources;
  linkTypes: TaskRelationshipType[];
  selected?: PropertyKey | null;
  onSelect: (property: PropertyKey) => void;
  className?: string;
};

/**
 * The searchable, sectioned list of properties a condition can filter on —
 * inside a condition's property picker, or on its own as the Filter popover's
 * first step when there are no conditions yet.
 */
export function PropertyList({ sources, linkTypes, selected, onSelect, className }: Props) {
  // Enum properties need values to pick from; without a source on this
  // surface they aren't offered, nor is anything that requires that source.
  const staticKeys = STATIC_PROPERTY_KEYS.filter((key) => {
    const meta = STATIC_PROPERTIES[key];
    if (meta.valueKind === "enum" && !sources[key]) return false;
    return !meta.requiresSource || !!sources[meta.requiresSource];
  });
  // "Task links" first, then each direction of each relationship type.
  const available: PropertyKey[] = [...staticKeys, ...linkPropertyKeys(linkTypes)];

  const groups = PROPERTY_SECTIONS.map((section) => ({
    label: section,
    options: available
      .map((key) => ({ key, meta: resolveProperty(key, linkTypes) }))
      .filter(({ meta }) => meta.section === section)
      .map(({ key, meta }) => ({
        key,
        label: meta.label,
        lead: <PropertyIcon icon={meta.icon} className="size-4 shrink-0" />,
      })),
  })).filter((g) => g.options.length > 0);

  return (
    <OptionCommandList
      groups={groups}
      selected={selected ? [selected] : []}
      onSelect={(key) => onSelect(key as PropertyKey)}
      searchPlaceholder="Search properties…"
      className={className}
    />
  );
}
