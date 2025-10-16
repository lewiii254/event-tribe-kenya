import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface DiscountCodeManagerProps {
  eventId: string;
}

interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_at: string;
}

const DiscountCodeManager = ({ eventId }: DiscountCodeManagerProps) => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
  });

  const fetchDiscountCodes = useCallback(async () => {
    const { data } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setDiscountCodes(data as DiscountCode[] || []);
  }, [eventId]);

  useEffect(() => {
    fetchDiscountCodes();
  }, [fetchDiscountCodes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("discount_codes").insert({
      event_id: eventId,
      code: formData.code.toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
    });

    if (error) {
      toast.error("Failed to create discount code");
      return;
    }

    toast.success("Discount code created successfully");
    setFormData({ code: "", discount_type: "percentage", discount_value: "", max_uses: "" });
    setIsAdding(false);
    fetchDiscountCodes();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("discount_codes")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update discount code");
      return;
    }

    toast.success("Discount code updated");
    fetchDiscountCodes();
  };

  const deleteCode = async (id: string) => {
    const { error } = await supabase.from("discount_codes").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete discount code");
      return;
    }

    toast.success("Discount code deleted");
    fetchDiscountCodes();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Discount Codes</CardTitle>
          <Button onClick={() => setIsAdding(!isAdding)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Discount Code
          </Button>
        </CardHeader>
        <CardContent>
          {isAdding && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., EARLYBIRD20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData({ ...formData, discount_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (KSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount_value">
                    {formData.discount_type === "percentage" ? "Percentage" : "Amount (KSh)"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="max_uses">Maximum Uses</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Discount Code</Button>
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {discountCodes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No discount codes yet. Create one to offer promotions.
              </p>
            ) : (
              discountCodes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold font-mono">{code.code}</h4>
                    <p className="text-sm text-muted-foreground">
                      {code.discount_type === "percentage"
                        ? `${code.discount_value}% off`
                        : `KSh ${code.discount_value} off`}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Used: {code.current_uses} / {code.max_uses || '∞'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={code.is_active}
                        onCheckedChange={() => toggleActive(code.id, code.is_active)}
                      />
                      <span className="text-sm">{code.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCode(code.id)}
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

export default DiscountCodeManager;
