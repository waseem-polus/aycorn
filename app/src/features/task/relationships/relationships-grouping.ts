import type {
  RelationshipBehavior,
  TaskRelationship,
} from "@/types/types";

export type RelationshipCategory = {
  key: string;
  label: string;
  color: string;
  icon: string;
  relationships: TaskRelationship[];
  typeId: number;
  direction: TaskRelationship["Direction"];
};

// The 6 directional buckets, in display order. Labels are fixed per
// (behavior, direction) because the system types' names don't read uniformly
// across directions (e.g. "parent"/"subtask" are nouns, "blocks" is a verb).
export const CATEGORY_ORDER: {
  behavior: RelationshipBehavior;
  direction: TaskRelationship["Direction"];
  label: string;
}[] = [
  { behavior: "blocking", direction: "to", label: "Blocked by" },
  { behavior: "blocking", direction: "from", label: "Blocks" },
  { behavior: "subtask", direction: "from", label: "Subtasks" },
  { behavior: "subtask", direction: "to", label: "Parent tasks" },
  { behavior: "link", direction: "from", label: "Mentions" },
  { behavior: "link", direction: "to", label: "Mentioned by" },
];

const bucketKey = (
  behavior: RelationshipBehavior,
  direction: TaskRelationship["Direction"],
) => `${behavior}-${direction}`;

// Groups relationships into the fixed ordered categories, dropping any that
// have no relationships. A relationship's icon/color come from its type.
export function groupIntoCategories(
  relationships: TaskRelationship[],
): RelationshipCategory[] {
  const byBucket = new Map<string, TaskRelationship[]>();
  for (const rel of relationships) {
    const key = bucketKey(rel.Type.Behavior, rel.Direction);
    const list = byBucket.get(key) ?? [];
    list.push(rel);
    byBucket.set(key, list);
  }

  return CATEGORY_ORDER.flatMap(({ behavior, direction, label }) => {
    const key = bucketKey(behavior, direction);
    const rels = byBucket.get(key);
    if (!rels || rels.length === 0) return [];
    const type = rels[0].Type;
    return [{ key, label, color: type.Color, icon: type.Icon, relationships: rels, typeId: type.ID, direction }];
  });
}
