import type { IMakeSetupProps } from "@calcom/app-store/make/pages/setup/_getServerSideProps";

import { AutomationApiKeySetup } from "../automation/AutomationApiKeySetup";

export default function MakeSetup({ inviteLink }: IMakeSetupProps) {
  return (
    <AutomationApiKeySetup
      appId="make"
      appName="Make"
      credentialType="make_automation"
      inviteLink={inviteLink}
      stepKeys={[
        "make_setup_step_scenario",
        "make_setup_step_trigger",
        "automation_setup_step_key",
        "automation_setup_step_test",
      ]}
    />
  );
}
