import { prisma } from "@calcom/prisma";
import {
  eventTypeLocations as eventTypeLocationsSchema,
  eventTypeMetaDataSchemaWithoutApps,
} from "@calcom/prisma/zod-utils";
import { getAppFromLocationValue } from "../utils";

/**
 * Process event types to add logo information
 * @param eventTypes - The event types to process
 */
const processEventTypes = (eventTypes: { id: number; title: string; locations: unknown }[]) => {
  const eventTypesWithLogo = eventTypes.map((eventType) => {
    const locationParsed = eventTypeLocationsSchema.safeParse(eventType.locations);

    const firstType = locationParsed.success ? locationParsed.data?.[0]?.type : undefined;
    const app = firstType ? getAppFromLocationValue(firstType) : undefined;
    return {
      ...eventType,
      logo: app?.logo,
    };
  });

  return {
    eventTypes: eventTypesWithLogo,
  };
};

export const getBulkUserEventTypes = async (userId: number) => {
  const eventTypes = await prisma.eventType.findMany({
    where: {
      userId: userId,
      teamId: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      length: true,
      locations: true,
      metadata: true,
      parentId: true,
    },
  });

  const filteredEventTypes = filterEventTypesWhereLocationUpdateIsAllowed(eventTypes);

  return processEventTypes(
    filteredEventTypes.map((eventType) => {
      const { metadata: _metadata, ...rest } = eventType;
      return { ...rest };
    })
  );
};

export const getBulkTeamEventTypes = async (teamId: number) => {
  const eventTypes = await prisma.eventType.findMany({
    where: {
      userId: null,
      teamId: teamId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      length: true,
      locations: true,
    },
  });

  return processEventTypes(eventTypes);
};

export const filterEventTypesWhereLocationUpdateIsAllowed = <
  T extends { parentId: number | null; metadata: unknown },
>(
  eventTypes: T[]
): T[] => {
  const filteredEventTypes = eventTypes.filter((eventType) => {
    if (!eventType.parentId) {
      return true;
    }

    const metadata = eventTypeMetaDataSchemaWithoutApps.safeParse(eventType.metadata);
    if (!metadata.success || !metadata.data?.managedEventConfig) {
      return true;
    }

    const unlockedFields = metadata.data.managedEventConfig.unlockedFields;
    return unlockedFields?.locations === true;
  });
  return filteredEventTypes;
};
