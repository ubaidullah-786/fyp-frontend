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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";

interface Member {
  _id: string;
  username: string;
  name: string;
  photo?: string;
}

interface Team {
  _id: string;
  name: string;
  creator: { _id: string; username: string; name: string } | string;
  members: Member[];
  color: string;
}

interface EditTeamDialogProps {
  editingTeam: Team | null;
  editName: string;
  editMembers: string[];
  memberSearch: string;
  searchResults: any[];
  searching: boolean;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onAddMember: (userId: string) => void;
  onRemoveMember: (userId: string) => void;
  getInitials: (name: string) => string;
}

export function EditTeamDialog({
  editingTeam,
  editName,
  editMembers,
  memberSearch,
  searchResults,
  searching,
  onClose,
  onSave,
  onNameChange,
  onSearchChange,
  onAddMember,
  onRemoveMember,
  getInitials,
}: EditTeamDialogProps) {
  return (
    <Dialog open={!!editingTeam} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
        <DialogHeader>
          <DialogTitle className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
            Edit Team
          </DialogTitle>
          <DialogDescription className="text-[rgb(136,136,136)]">
            Update team name and manage members
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Team Name */}
          <div>
            <Label className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-2">
              Team Name
            </Label>
            <Input
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
              className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
            />
          </div>

          {/* Member Search */}
          <div>
            <Label className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-2">
              Add Members
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(136,136,136)]" />
              <Input
                value={memberSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by username..."
                className="pl-10 h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all placeholder:text-[rgb(136,136,136)]"
              />
            </div>
            {searchResults.length === 0 && memberSearch.length >= 2 && (
              <div className="flex items-center gap-2 text-[rgb(136,136,136)] py-2 mt-2">
                <X className="h-4 w-4 text-red-500" />
                <span className="text-sm">No user found</span>
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-md max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => onAddMember(user._id)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-[rgb(237,237,237)] dark:hover:bg-[rgb(237,237,237)]/10 transition-colors cursor-pointer"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.photo} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                        {user.name}
                      </p>
                      <p className="text-xs text-[rgb(136,136,136)]">
                        @{user.username}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current Members */}
          <div>
            <Label className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-2">
              Current Members ({editMembers.length})
            </Label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
              {editingTeam?.members
                .filter((m) => editMembers.includes(m._id))
                .map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-2 bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.photo} />
                        <AvatarFallback className="text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                          {member.name}
                        </p>
                        <p className="text-xs text-[rgb(136,136,136)]">
                          @{member.username}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveMember(member._id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[1.3px] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={
              !editName.trim() ||
              editMembers.length === 0 ||
              editName === editingTeam?.name
            }
            className="bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(237,237,237)] dark:text-[rgb(0,0,0)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
