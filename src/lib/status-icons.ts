import {
  Lightbulb,
  MagnifyingGlass,
  Hammer,
  Rocket,
  Archive,
} from "@phosphor-icons/react/dist/ssr";
import type { IdeaStatus } from "@/lib/constants";

// SSR-safe icon builds work in both server and client components.
export const STATUS_ICONS: Record<IdeaStatus, typeof Lightbulb> = {
  DRAFT: Lightbulb,
  EXPLORING: MagnifyingGlass,
  BUILDING: Hammer,
  LAUNCHED: Rocket,
  ARCHIVED: Archive,
};
