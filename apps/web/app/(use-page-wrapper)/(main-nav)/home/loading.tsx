import { HomeSkeleton } from "~/shell/skeletons";
import { ShellMainAppDir } from "../ShellMainAppDir";

export default function Loading() {
  return (
    <ShellMainAppDir>
      <HomeSkeleton />
    </ShellMainAppDir>
  );
}
