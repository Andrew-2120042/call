import SVG from "react-inlinesvg";

import { ICON_SPRITE_VERSION } from "./icon-names";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const vercelCommitHash = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const commitHash = vercelCommitHash ? `-${vercelCommitHash.slice(0, 7)}` : "";

export function IconSprites() {
  return (
    <SVG
      src={`${process.env.NEXT_PUBLIC_WEBAPP_URL}/icons/sprite.svg?v=${process.env.NEXT_PUBLIC_CALCOM_VERSION}-${ICON_SPRITE_VERSION}${commitHash}`}
    />
  );
}

export default IconSprites;
