import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, User, LogOut, Heart, LayoutDashboard, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkRole = async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .in("role", ["organizer", "admin"])
        .maybeSingle();
      setIsOrganizer(!!data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkRole(session.user.id), 0);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => checkRole(session.user.id), 0);
      } else {
        setIsOrganizer(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              <div className="absolute inset-0 blur-xl bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              EventTribe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/events">Events</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/calendar">Calendar</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/favorites">
                    <Heart className="w-4 h-4 mr-2" />
                    Favorites
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/my-bookings">My Bookings</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/create">Create Event</Link>
                </Button>
                {isOrganizer && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/organizer">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Organizer
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90 rounded-full shadow-md hover:shadow-lg">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                      EventTribe
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  {user ? (
                    <>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/events">Events</Link>
                      </Button>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/calendar">Calendar</Link>
                      </Button>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/favorites">
                          <Heart className="w-4 h-4 mr-2" />
                          Favorites
                        </Link>
                      </Button>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/my-bookings">My Bookings</Link>
                      </Button>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/create">Create Event</Link>
                      </Button>
                      {isOrganizer && (
                        <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                          <Link to="/organizer">
                            <LayoutDashboard className="w-4 h-4 mr-2" />
                            Organizer
                          </Link>
                        </Button>
                      )}
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/profile">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start" 
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" className="justify-start" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/auth">Login</Link>
                      </Button>
                      <Button className="justify-start bg-primary hover:bg-primary/90" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/auth">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
