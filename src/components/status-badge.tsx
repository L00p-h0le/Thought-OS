import { STATUS_CSS, STATUS_LABELS, type IdeaStatus } from "@/lib/constants";
import { STATUS_ICONS } from "@/lib/status-icons";

export function StatusBadge({ status }: { status: string }) {
  const s = (status in STATUS_LABELS ? status : "DRAFT") as IdeaStatus;
  const Icon = STATUS_ICONS[s];
  return (
    <span className={`chip ${STATUS_CSS[s]}`}>
      <Icon weight="bold" className="w-3 h-3" aria-hidden />
      {STATUS_LABELS[s]}
    </span>
  );
}
