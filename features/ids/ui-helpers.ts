import { status } from "./types";

export function IDCardStatusLabel(
  type: (typeof status)[number]["name"],
  t: (key: string) => string
) {
  return t(`ids.status.${type}`);
}
