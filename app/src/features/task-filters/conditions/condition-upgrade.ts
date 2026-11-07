import type {
  ConditionGroup,
  ConditionNode,
  ConditionValue,
  DateRef,
} from "@/features/task-filters/conditions/condition-types";

/** v1 kept local days as bare strings, with "" for an unpicked range end. */
type LegacyDateValue =
  | { kind: "date"; date: string }
  | { kind: "range"; from: string; to: string };

const legacyRef = (day: string): DateRef | null => (day ? { kind: "absolute", date: day } : null);

const upgradeValue = (value: ConditionValue | LegacyDateValue): ConditionValue => {
  if (!value) return value;
  if (value.kind === "date" && "date" in value) {
    const ref = legacyRef(value.date);
    return ref ? { kind: "date", ref } : null;
  }
  if (value.kind === "range" && (typeof value.from === "string" || typeof value.to === "string")) {
    const legacy = value as Extract<LegacyDateValue, { kind: "range" }>;
    return { kind: "range", from: legacyRef(legacy.from), to: legacyRef(legacy.to) };
  }
  return value as ConditionValue;
};

const upgradeNode = (node: ConditionNode): ConditionNode =>
  node.kind === "group"
    ? upgradeGroup(node)
    : { ...node, value: upgradeValue(node.value as ConditionValue | LegacyDateValue) };

/**
 * Brings a tree from any earlier shape up to the current one. It reads the
 * values themselves rather than trusting a version number, so it's safe on
 * current trees too — saved definitions, scratch conditions, and unversioned
 * drafts all go through it.
 */
export const upgradeGroup = <G extends ConditionGroup>(group: G): G => ({
  ...group,
  children: group.children.map(upgradeNode),
});
