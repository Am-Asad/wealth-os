"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type GenericTabItem<TValue extends string> = {
  value: TValue;
  label: string;
  content: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
};

type GenericTabsProps<TValue extends string> = {
  defaultValue: TValue;
  items: readonly GenericTabItem<TValue>[];
  className?: string;
  listClassName?: string;
};

const GenericTabs = <TValue extends string>({
  defaultValue,
  items,
  className,
  listClassName,
}: GenericTabsProps<TValue>) => {
  return (
    <Tabs defaultValue={defaultValue} className={className}>
      <TabsList className={listClassName}>
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className={item.triggerClassName}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {items.map((item) => (
        <TabsContent key={item.value} value={item.value} className={item.contentClassName}>
          {item.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default GenericTabs;
