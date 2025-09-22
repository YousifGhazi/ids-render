import { useAuthStore } from "@/features/auth/store";

export function Permission({
  can,
  children,
}: {
  can: string;
  children: React.ReactNode;
}) {
  const authorized = useAuthStore((state) => state.can(can));
  if (!authorized) {
    return null;
  }
  return <>{children}</>;
}
