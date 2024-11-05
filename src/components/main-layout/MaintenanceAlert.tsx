import React, { useState } from "react";
import useAsyncEffect from "use-async-effect";
import clientApiServices from "@/services/clientApiServices";
import { Interweave } from "interweave";

export function MaintenanceAlert() {
  const [maintenanceMessageHtml, setMaintenanceMessageHtml] = useState<string | null>(null);

  useAsyncEffect(async _ => {
    try {
      const info = (await clientApiServices.distribrainNodesApi.nodesControllerGetMaintenanceInfo()).data;
      if (info.maintenanceModeActive) {
        setMaintenanceMessageHtml(info.message!);
      }
    } catch (err: any) {
      console.error(err);
      setMaintenanceMessageHtml("Service is under maintenance. We expect to get back soon. Thank you for your patience!");
    }
  }, []);

  if (maintenanceMessageHtml == null)
    return <></>;

  return <>
    <div className="maintenance-message">
      <div className="wrapper">
        <Interweave
          content={maintenanceMessageHtml}
          escapeHtml={false}
          noWrap={true}
        />
      </div>
    </div>

    <div className="maintenance-message-pusher"/>
  </>
}