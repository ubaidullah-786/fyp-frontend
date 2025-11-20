"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Team {
  _id: string;
  name: string;
}

interface DeleteTeamDialogProps {
  team: Team | null;
  onClose: () => void;
  onConfirm: (teamId: string) => void;
}

export function DeleteTeamDialog({
  team,
  onClose,
  onConfirm,
}: DeleteTeamDialogProps) {
  return (
    <Dialog open={!!team} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
        <DialogHeader>
          <DialogTitle className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
            Delete Team
          </DialogTitle>
          <DialogDescription className="text-[rgb(136,136,136)]">
            Are you sure you want to delete "{team?.name}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[1.3px] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => team && onConfirm(team._id)}
            className="bg-red-500 text-white hover:bg-red-600 cursor-pointer"
          >
            Delete Team
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
