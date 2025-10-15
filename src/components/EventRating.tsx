import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EventRatingProps {
  eventId: string;
  userId: string | undefined;
  existingRating?: { rating: number; review: string };
  onRatingSubmit: () => void;
}

const EventRating = ({ eventId, userId, existingRating, onRatingSubmit }: EventRatingProps) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [review, setReview] = useState(existingRating?.review || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please sign in to rate this event");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("event_ratings").upsert({
        event_id: eventId,
        user_id: userId,
        rating,
        review: review.trim() || null,
      });

      if (error) throw error;

      toast.success("Rating submitted successfully!");
      onRatingSubmit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit rating";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium mb-2">Rate this event</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <Textarea
          placeholder="Share your experience (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button onClick={handleSubmit} disabled={submitting || rating === 0}>
        {submitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
      </Button>
    </div>
  );
};

export default EventRating;
