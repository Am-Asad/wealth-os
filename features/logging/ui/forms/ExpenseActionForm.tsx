"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ExpenseActionForm = () => {
  return (
    <>
      <div className="space-y-1.5">
        <Label>Amount</Label>
        <Input placeholder="e.g. 45000 (minor units)" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Account</Label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ubl">UBL</SelectItem>
              <SelectItem value="nayapay">Nayapay</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Input placeholder="Food / Transport / etc" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Note (optional)</Label>
        <Textarea placeholder="Payee, description, tags..." />
      </div>
    </>
  );
};

export default ExpenseActionForm;
