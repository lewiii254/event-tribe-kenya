import { Database } from "@/integrations/supabase/types";

// Base types from database
type EventRow = Database["public"]["Tables"]["events"]["Row"];
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type EventRatingRow = Database["public"]["Tables"]["event_ratings"]["Row"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];

// Event type with relations
export interface Event extends EventRow {
  profiles?: {
    username: string;
    avatar_url?: string | null;
  };
  bookings?: Array<{ count?: number }>;
  event_ratings?: Array<{
    rating: number;
    review: string | null;
    created_at: string;
    profiles?: {
      username: string;
    };
  }>;
}

// Booking type
export type Booking = BookingRow;

// Profile/User type
export type Profile = ProfileRow;

// Event Rating type
export type EventRating = EventRatingRow;

// User role type
export type UserRole = UserRoleRow;

// Error with message property
export interface ErrorWithMessage {
  message: string;
}

// Check if error has message
export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

// Convert error to ErrorWithMessage
export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

// Get error message from unknown error
export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}
