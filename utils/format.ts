import dayjs from "dayjs";

export function formatDate(date: Date | string) {
  if (!date) return "";
  return dayjs(date).format("MMMM D, YYYY");
}
