import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Facebook, Twitter, Linkedin, Link2, Mail } from "lucide-react";
import { toast } from "sonner";

interface ShareEventDialogProps {
  eventTitle: string;
  eventId: string;
}

const ShareEventDialog = ({ eventTitle, eventId }: ShareEventDialogProps) => {
  const url = `${window.location.origin}/event/${eventId}`;
  const text = `Check out this event: ${eventTitle}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:bg-[#1877f2] hover:text-white",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      color: "hover:bg-[#1da1f2] hover:text-white",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: "hover:bg-[#0077b5] hover:text-white",
    },
    {
      name: "Email",
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(text + "\n\n" + url)}`,
      color: "hover:bg-primary hover:text-white",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-describedby="share-description">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
          <DialogDescription id="share-description">
            Share this event with your friends and network
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            <Button size="sm" variant="ghost" onClick={copyToClipboard}>
              <Link2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                className={`flex items-center gap-2 transition-all ${link.color}`}
                onClick={() => window.open(link.url, "_blank")}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareEventDialog;
