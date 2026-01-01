"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function CreateAnalyticsTagDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (input: { name: string; storeId?: string | null }) => void;
  isLoading?: boolean;
}) {
  const [name, setName] = useState("");
  const { activeStoreId } = useStoreScope();

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create analytics tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-3">
            <Label>Name</Label>
            <Input
              placeholder="Main Storefront"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            {activeStoreId
              ? `This tag will be scoped to the active store.`
              : `This tag will be scoped to the entire company.`}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || props.isLoading}
            onClick={() =>
              props.onCreate({
                name: name.trim(),
                storeId: activeStoreId ?? null,
              })
            }
          >
            {props.isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
