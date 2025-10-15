import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface RatingDisplayProps {
  ratings: Array<{
    rating: number;
    review: string | null;
    profiles?: { username: string } | null;
    created_at: string;
  }>;
}

const RatingDisplay = ({ ratings }: RatingDisplayProps) => {
  if (ratings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No ratings yet. Be the first to rate this event!
      </div>
    );
  }

  const averageRating = (
    ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <div className="text-4xl font-bold">{averageRating}</div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(parseFloat(averageRating))
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {ratings.length} review{ratings.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {ratings.map((rating, idx) => {
          const username = rating.profiles?.username || "Anonymous";
          return (
            <div key={idx} className="border-b border-border pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{username}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= rating.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rating.review && (
                    <p className="text-sm text-muted-foreground">{rating.review}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDisplay;
