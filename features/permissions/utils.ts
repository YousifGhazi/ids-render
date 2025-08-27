import { Permission } from "./types";

type TreeNodeData = {
  value: string;
  label: string;
  children?: TreeNodeData[];
};

export function permissionsToNestedTree(
  permissions: Permission[],
  t: (key: string) => string
): TreeNodeData[] {
  const prefixes = ["admin", "organization"];
  const normalizeEntity = (entity: string): string => {
    const lower = entity.toLowerCase();
    // Words that are the same singular/plural, or special cases.
    if (["news", "permissions"].includes(lower)) {
      return lower;
    }
    if (lower.endsWith("ies")) {
      return lower.slice(0, -3) + "y"; // identities -> identity
    }
    if (lower.endsWith("s")) {
      return lower.slice(0, -1); // users -> user
    }
    return lower;
  };

  const byEntity: Record<string, Map<string, { id: number; raw: string }>> = {};

  const prefixPattern = new RegExp(`^(${prefixes.join("|")})-`);

  for (const { id, name } of permissions) {
    const stripped = name.replace(prefixPattern, "");
    const parts = stripped.split("-").filter(Boolean);

    if (parts.length === 0) continue;

    let action: string;
    let entity: string;

    // The 'list' action is a special case, it's a suffix.
    // e.g., "templates-list"
    if (parts.length > 1 && parts[parts.length - 1] === "list") {
      action = "list";
      entity = parts.slice(0, -1).join("-");
    } else {
      // Other actions are prefixes.
      // e.g., "create-template"
      action = parts[0];
      entity = parts.slice(1).join("-");
    }

    // This handles cases like "news" where there's only one part after stripping prefix.
    // It becomes action="news", entity="". We fix that here.
    if (!entity && action) {
      entity = action;
      action = "list"; // Assume 'list' for single-name permissions
    }

    const normEntity = normalizeEntity(entity);
    const normAction = action.toLowerCase();

    byEntity[normEntity] ||= new Map();
    byEntity[normEntity].set(normAction, { id, raw: name });
  }

  const tree: TreeNodeData[] = Object.entries(byEntity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([entity, actionsMap]) => {
      const parentValue = entity;
      const parentLabel = t(`role.rolesList.${entity}`);

      const children: TreeNodeData[] = Array.from(actionsMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([action, meta]) => ({
          value: `${meta.id}`, // Unique value for each leaf
          label: t(`${action}`),
        }));

      return {
        value: parentValue,
        label: parentLabel,
        children,
      };
    });

  return tree;
}
