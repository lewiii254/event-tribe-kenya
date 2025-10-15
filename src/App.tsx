import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import MyBookings from "./pages/MyBookings";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import ManageEvent from "./pages/ManageEvent";
import Admin from "./pages/Admin";
import EventCalendar from "./pages/EventCalendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/events" element={<Events />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/event/:id/manage" element={<ManageEvent />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/calendar" element={<EventCalendar />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
