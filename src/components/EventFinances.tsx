import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Plus, TrendingDown, TrendingUp } from "lucide-react";

interface EventFinancesProps {
  eventId: string;
}

interface Budget {
  id: string;
  event_id: string;
  total_budget: number;
  total_revenue: number;
  total_expenses: number;
}

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  created_at: string;
}

const EventFinances = ({ eventId }: EventFinancesProps) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
  });

  const fetchFinancialData = useCallback(async () => {
    const { data: budgetData } = await supabase
      .from("event_budgets")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    if (!budgetData) {
      await supabase.from("event_budgets").insert({
        event_id: eventId,
        total_budget: 0,
        total_revenue: 0,
        total_expenses: 0,
      });
      fetchFinancialData();
      return;
    }

    setBudget(budgetData as Budget);

    const { data: expensesData } = await supabase
      .from("event_expenses")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    setExpenses(expensesData as Expense[] || []);
  }, [eventId]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("event_expenses").insert({
      event_id: eventId,
      ...formData,
      amount: parseFloat(formData.amount),
    });

    if (error) {
      toast.error("Failed to add expense");
      return;
    }

    const newTotal = (budget?.total_expenses || 0) + parseFloat(formData.amount);
    await supabase
      .from("event_budgets")
      .update({ total_expenses: newTotal })
      .eq("event_id", eventId);

    toast.success("Expense added successfully");
    setFormData({ category: "", description: "", amount: "" });
    setIsAddingExpense(false);
    fetchFinancialData();
  };

  const netProfit = (budget?.total_revenue || 0) - (budget?.total_expenses || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KSh {(budget?.total_revenue || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KSh {(budget?.total_expenses || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              KSh {netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expenses</CardTitle>
          <Button onClick={() => setIsAddingExpense(!isAddingExpense)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          {isAddingExpense && (
            <form onSubmit={handleAddExpense} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount (KSh)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Expense</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddingExpense(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No expenses recorded yet
              </p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{expense.description}</h4>
                    <p className="text-sm text-muted-foreground capitalize">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">- KSh {expense.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </div>
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

export default EventFinances;
