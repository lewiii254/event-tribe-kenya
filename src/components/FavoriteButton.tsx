import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  eventId: string;
  user: {
    id: string;
  } | null;
  className?: string;
}

const FavoriteButton = ({ eventId, user, className }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFavorite = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("event_favorites")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .maybeSingle();

    setIsFavorite(!!data);
  }, [user, eventId]);

  useEffect(() => {
    if (user) {
      checkFavorite();
    }
  }, [user, eventId, checkFavorite]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from("event_favorites")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);
        
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await supabase.from("event_favorites").insert({
          event_id: eventId,
          user_id: user.id,
        });
        
        setIsFavorite(true);
        toast.success("Added to favorites!");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFavorite}
      disabled={loading}
      className={cn(className)}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all",
          isFavorite && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
};

export default FavoriteButton;
