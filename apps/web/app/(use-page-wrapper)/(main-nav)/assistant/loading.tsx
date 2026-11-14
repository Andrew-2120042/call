import { AssistantSkeleton } from "~/shell/skeletons";
import { ShellMainAppDir } from "../ShellMainAppDir";

export default function Loading() {
  return (
    <ShellMainAppDir>
      <AssistantSkeleton />
    </ShellMainAppDir>
  );
}
