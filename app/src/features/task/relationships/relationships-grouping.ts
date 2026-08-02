import {
  RELATIONSHIP_BEHAVIORS,
  type RelationshipBehavior,
  type TaskRelationship,
  type TaskRelationshipType,
} from "@/types/types";

// Which direction is listed first within a type's section pair, per behavior.
const DIRECTION_ORDER: Record<
  RelationshipBehavior,
  TaskRelationship["Direction"][]
> = {
  blocking: ["to", "from"],
  subtask: ["to", "from"],
  link: ["from", "to"],
};

// Nicer copy that only makes sense for the 3 seeded system types (one per
// behavior). Gated on Type.IsSystem below — never on Behavior alone — so a
// custom type sharing a behavior with a system type falls through to its own
// FromName/ToName instead of colliding with the system type's copy.
const SYSTEM_LABELS: Record<
  RelationshipBehavior,
  Record<TaskRelationship["Direction"], string>
> = {
  blocking: { to: "Blocked By", from: "Blocks" },
  subtask: { from: "Parents", to: "Subtasks" },
  link: { from: "Mentions", to: "Mentioned By" },
};

export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

const labelForGroup = (
  type: TaskRelationshipType,
  direction: TaskRelationship["Direction"],
): string => {
  if (type.IsSystem) return SYSTEM_LABELS[type.Behavior][direction];
  return capitalize(direction === "from" ? type.FromName : type.ToName);
};

export type RelationshipDirectionGroup = {
  key: string; // `${type.ID}-${direction}`
  direction: TaskRelationship["Direction"];
  label: string;
  relationships: TaskRelationship[];
};

export type RelationshipTypeGroup = {
  key: string; // String(type.ID)
  type: TaskRelationshipType;
  total: number; // sum across both directions
  directions: RelationshipDirectionGroup[]; // 1 or 2 entries, already ordered
};

// Groups relationships by exact TaskRelationshipType.ID (never by Behavior),
// then orders the resulting type-groups: behavior first (blocking, subtask,
// link), then ascending Type.ID within a behavior. Each type-group's own
// direction entries are adjacent and ordered per DIRECTION_ORDER, with only
// directions that actually have >=1 relationship emitted.
export function groupRelationshipsByType(
  relationships: TaskRelationship[],
): RelationshipTypeGroup[] {
  const byTypeId = new Map<
    number,
    {
      type: TaskRelationshipType;
      byDirection: Map<TaskRelationship["Direction"], TaskRelationship[]>;
    }
  >();

  for (const rel of relationships) {
    let entry = byTypeId.get(rel.Type.ID);
    if (!entry) {
      entry = { type: rel.Type, byDirection: new Map() };
      byTypeId.set(rel.Type.ID, entry);
    }
    const list = entry.byDirection.get(rel.Direction) ?? [];
    list.push(rel);
    entry.byDirection.set(rel.Direction, list);
  }

  const sortedEntries = [...byTypeId.values()].sort((a, b) => {
    const behaviorDiff =
      RELATIONSHIP_BEHAVIORS.indexOf(a.type.Behavior) -
      RELATIONSHIP_BEHAVIORS.indexOf(b.type.Behavior);
    return behaviorDiff !== 0 ? behaviorDiff : a.type.ID - b.type.ID;
  });

  return sortedEntries.map(({ type, byDirection }) => {
    const directions = DIRECTION_ORDER[type.Behavior]
      .filter((direction) => byDirection.has(direction))
      .map((direction) => ({
        key: `${type.ID}-${direction}`,
        direction,
        label: labelForGroup(type, direction),
        relationships: byDirection.get(direction)!,
      }));
    const total = directions.reduce((sum, d) => sum + d.relationships.length, 0);
    return { key: String(type.ID), type, total, directions };
  });
}

export type RelationshipSection = {
  key: string;
  type: TaskRelationshipType;
  direction: TaskRelationship["Direction"];
  label: string;
  relationships: TaskRelationship[];
};

// Flattens type-groups into one row per (type, direction) — what the drawer's
// per-section list and the card's per-badge list both need.
export function toRelationshipSections(
  groups: RelationshipTypeGroup[],
): RelationshipSection[] {
  return groups.flatMap(({ type, directions }) =>
    directions.map((d) => ({
      key: d.key,
      type,
      direction: d.direction,
      label: d.label,
      relationships: d.relationships,
    })),
  );
}
