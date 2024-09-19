import { DbCompanySettings } from "@/types/dbTypes";
import { Profile } from "@/types/models";
import { ROLES } from "./roles";

export const hasAccessToAudit = (user?: Profile | null, settings?: DbCompanySettings | null) => {
  return user?.role !== ROLES.PROSPECT || settings?.composition_workflow;
};
