"use client";
import { Input } from "@/components/ui/input";

const InvestmentActionForm = () => {
  return (
    <>
      <Input placeholder="Investment name" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Contribution amount" />
        <Input placeholder="Debited account" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Units purchased (optional)" />
        <Input placeholder="Price per unit (optional)" />
      </div>
    </>
  );
};

export default InvestmentActionForm;
