"use client";

import { useSessionStore } from "@/store/useSessionStore";
import React from "react";

export function usePermissions() {
  const user = useSessionStore(state => state.user);
  return {
    can: (permission: string) => user?.role === "SUPER_ADMIN" || user?.permissions.includes(permission),
    isSuperAdmin: user?.role === "SUPER_ADMIN",
  };
}

export function Can({ permission, children }: { permission: string, children: React.ReactNode }) {
  const { can } = usePermissions();
  if (!can(permission)) return null;
  return <>{children}</>;
}
