import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-muted">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {(actionLabel && (actionLink || onAction)) && (
        actionLink ? (
          <Button asChild className="rounded-full">
            <Link to={actionLink}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button onClick={onAction} className="rounded-full">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
};

export default EmptyState;
