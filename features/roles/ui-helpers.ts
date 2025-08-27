import { RoleType } from "./types";

export function RoleTypeLabel(type: RoleType, t: (key: string) => string) {
  switch (type) {
    case "admin":
      return t("role.type.admin");
    case "organization":
      return t("role.type.organization");
  }
}
