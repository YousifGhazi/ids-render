import { useAuthStore } from "@/features/auth/store";

export function Permission({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const can = useAuthStore((state) => state.can(permission));
  if (!can) {
    return null;
  }
  return <>{children}</>;
}
