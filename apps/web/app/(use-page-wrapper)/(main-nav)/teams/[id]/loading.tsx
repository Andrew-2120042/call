import { SettingsPageSkeleton } from "~/shell/skeletons";
import { ShellMainAppDir } from "../../ShellMainAppDir";

export default function Loading() {
  return (
    <ShellMainAppDir>
      <SettingsPageSkeleton />
    </ShellMainAppDir>
  );
}
