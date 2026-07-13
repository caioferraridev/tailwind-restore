import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import PortalLayout from "@/components/client-portal/PortalLayout";
import PortalHeader from "@/components/client-portal/PortalHeader";

export const Route = createFileRoute("/app/clients/")({
  component: PortalDashboard,
});

function PortalDashboard() {

  const portalUser = JSON.parse(
    localStorage.getItem("portalUser") || "{}"
  );

  const clientId = portalUser.client_id;

  const { data: client } = useQuery({
    queryKey: ["portal-client", clientId],

    enabled: !!clientId,

    queryFn: async () => {

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error) throw error;

      return data;

    },
  });

  return (

    <PortalLayout>

      <PortalHeader
        companyName={client?.company_name}
      />

    </PortalLayout>

  );

}