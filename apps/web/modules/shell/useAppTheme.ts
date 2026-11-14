"use client";

import getBrandColours from "@calcom/lib/getBrandColours";
import useTheme from "@calcom/lib/hooks/useTheme";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { useCalcomTheme } from "@calcom/ui/styles";

export const useAppTheme = () => {
  const { data: user } = useMeQuery();
  const brandTheme = getBrandColours({
    lightVal: user?.brandColor,
    darkVal: user?.darkBrandColor,
  });
  useCalcomTheme(brandTheme);
  // Dark unless the owner picks light in Appearance; the dashboard is designed dark-first.
  useTheme(user?.appTheme ?? "dark");
};
