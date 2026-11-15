import type { IZapierSetupProps } from "@calcom/app-store/zapier/pages/setup/_getServerSideProps";

import { AutomationApiKeySetup } from "../automation/AutomationApiKeySetup";

export default function ZapierSetup({ inviteLink }: IZapierSetupProps) {
  return (
    <AutomationApiKeySetup
      appId="zapier"
      appName="Zapier"
      credentialType="zapier_automation"
      inviteLink={inviteLink}
      stepKeys={[
        "zapier_setup_step_zap",
        "zapier_setup_step_trigger",
        "automation_setup_step_key",
        "automation_setup_step_test",
      ]}
    />
  );
}
