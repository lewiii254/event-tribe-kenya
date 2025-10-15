import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface EventRatingsProps {
  eventId: string;
  user: {
    id: string;
  } | null;
}

interface Rating {
  id: string;
  user_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  profiles: {
    username: string;
  } | null;
}

const EventRatings = ({ eventId, user }: EventRatingsProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const fetchRatings = useCallback(async () => {
    const { data } = await supabase
      .from("event_ratings")
      .select(`
        *,
        profiles (username)
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (data) {
      setRatings(data as Rating[]);
      
      if (user) {
        const existing = data.find((r) => r.user_id === user.id);
        if (existing) {
          setHasRated(true);
          setUserRating(existing.rating);
          setUserReview(existing.review || "");
        }
      }
    }
  }, [eventId, user]);

  useEffect(() => {
    fetchRatings();

    // Subscribe to realtime ratings
    const channel = supabase
      .channel(`ratings-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_ratings',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          fetchRatings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, user, fetchRatings]);

  const handleSubmitRating = async () => {
    if (!user) {
      toast.error("Please sign in to rate this event");
      return;
    }

    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);
    try {
      if (hasRated) {
        await supabase
          .from("event_ratings")
          .update({
            rating: userRating,
            review: userReview.trim() || null,
          })
          .eq("event_id", eventId)
          .eq("user_id", user.id);
        
        toast.success("Rating updated!");
      } else {
        await supabase.from("event_ratings").insert({
          event_id: eventId,
          user_id: user.id,
          rating: userRating,
          review: userReview.trim() || null,
        });
        
        toast.success("Rating submitted!");
        setHasRated(true);
      }
    } catch (error) {
      toast.error("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Ratings & Reviews</h3>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
          <span className="text-2xl font-bold">{avgRating}</span>
          <span className="text-muted-foreground">({ratings.length})</span>
        </div>
      </div>

      {user && (
        <Card className="p-6 mb-6">
          <h4 className="font-semibold mb-4">{hasRated ? "Update Your Rating" : "Rate This Event"}</h4>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setUserRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= userRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Share your experience (optional)..."
            value={userReview}
            onChange={(e) => setUserReview(e.target.value)}
            className="mb-4"
            rows={3}
          />
          <Button onClick={handleSubmitRating} disabled={loading}>
            {loading ? "Submitting..." : hasRated ? "Update Rating" : "Submit Rating"}
          </Button>
        </Card>
      )}

      <div className="space-y-4">
        {ratings.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No ratings yet. Be the first to rate this event!
          </p>
        ) : (
          ratings.map((rating) => (
            <Card key={rating.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {rating.profiles?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">
                      {rating.profiles?.username || "Anonymous"}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: rating.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  {rating.review && (
                    <p className="text-sm text-muted-foreground">{rating.review}</p>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EventRatings;
