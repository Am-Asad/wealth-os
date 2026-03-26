"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TransferActionForm = () => {
  return (
    <>
      <Input placeholder="Amount" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="From account" />
        <Input placeholder="To account" />
      </div>
      <Textarea placeholder="Optional note / linked goal" />
    </>
  );
};

export default TransferActionForm;
