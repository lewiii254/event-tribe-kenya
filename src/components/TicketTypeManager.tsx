import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

interface TicketTypeManagerProps {
  eventId: string;
}

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity_available: number | null;
  quantity_sold: number;
  is_active: boolean;
  created_at: string;
}

const TicketTypeManager = ({ eventId }: TicketTypeManagerProps) => {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity_available: "",
  });

  const fetchTicketTypes = useCallback(async () => {
    const { data } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    setTicketTypes(data as TicketType[] || []);
  }, [eventId]);

  useEffect(() => {
    fetchTicketTypes();
  }, [fetchTicketTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("ticket_types").insert({
      event_id: eventId,
      ...formData,
      price: parseFloat(formData.price),
      quantity_available: formData.quantity_available ? parseInt(formData.quantity_available) : null,
    });

    if (error) {
      toast.error("Failed to create ticket type");
      return;
    }

    toast.success("Ticket type created successfully");
    setFormData({ name: "", description: "", price: "", quantity_available: "" });
    setIsAdding(false);
    fetchTicketTypes();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("ticket_types")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update ticket type");
      return;
    }

    toast.success("Ticket type updated");
    fetchTicketTypes();
  };

  const deleteTicketType = async (id: string) => {
    const { error } = await supabase.from("ticket_types").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete ticket type");
      return;
    }

    toast.success("Ticket type deleted");
    fetchTicketTypes();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ticket Types</CardTitle>
          <Button onClick={() => setIsAdding(!isAdding)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket Type
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div>
                <Label htmlFor="name">Ticket Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Early Bird, VIP"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what's included"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (KSh)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Available Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity_available}
                    onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Ticket Type</Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {ticketTypes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No ticket types yet. Create one to get started.
              </p>
            ) : (
              ticketTypes.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{ticket.name}</h4>
                    <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="font-medium">KSh {ticket.price}</span>
                      <span className="text-muted-foreground">
                        {ticket.quantity_sold || 0} / {ticket.quantity_available || '∞'} sold
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ticket.is_active}
                        onCheckedChange={() => toggleActive(ticket.id, ticket.is_active)}
                      />
                      <span className="text-sm">{ticket.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTicketType(ticket.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketTypeManager;
