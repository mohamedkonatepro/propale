import { NextApiRequest, NextApiResponse } from "next";
import { supabase, supabaseAdmin } from "@/lib/supabaseClient";
import corsMiddleware, { cors } from "@/lib/corsMiddleware";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await corsMiddleware(req, res, cors);
  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      // Fetch stepper session IDs for the given prospect
      const { data: sessionIds, error: sessionError } = await supabase
        .from("stepper_sessions")
        .select("id")
        .eq("prospect_id", id);

      if (sessionError) {
        throw new Error("Error fetching stepper session IDs");
      }

      const sessionIdList = sessionIds?.map((session) => session.id) || [];

      // Delete stepper responses
      if (sessionIdList.length > 0) {
        const { error: responseError } = await supabase
          .from("stepper_responses")
          .delete()
          .in("session_id", sessionIdList);

        if (responseError) {
          throw new Error("Error deleting stepper responses");
        }
      }

      // Delete stepper sessions
      const { error: sessionDeleteError } = await supabase
        .from("stepper_sessions")
        .delete()
        .eq("prospect_id", id);

      if (sessionDeleteError) {
        throw new Error("Error deleting stepper sessions");
      }

      // Delete proposals associated with the prospect
      const { error: proposalError } = await supabase
        .from("proposals")
        .delete()
        .eq("prospect_id", id);

      if (proposalError) {
        throw new Error("Error deleting proposals");
      }

      // Delete associated users via Supabase Admin API
      const { data: profileData, error: profileError } = await supabase
        .from("companies_profiles")
        .select("profile_id")
        .eq("company_id", id);

      if (profileError) {
        throw new Error("Error fetching profile data");
      }

      for (const profile of profileData || []) {
        const result = await supabaseAdmin.auth.admin.deleteUser(profile.profile_id);
        if (result.error) {
          throw new Error(`Error deleting user with profile id ${profile.profile_id}`);
        }
      }

      // Delete the company
      const { error: companyError } = await supabase
        .from("company")
        .delete()
        .eq("id", id);

      if (companyError) {
        throw new Error("Error deleting company");
      }

      return res.status(200).json({ message: "Prospect, related data, and users deleted successfully" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      return res.status(500).json({ error: errorMessage });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
