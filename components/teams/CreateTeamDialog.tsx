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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, X, AlertCircle } from "lucide-react";

interface CreateTeamDialogProps {
  isOpen: boolean;
  newTeamName: string;
  newTeamSearch: string;
  newTeamSearchResults: any[];
  selectedNewUsers: any[];
  creatingTeam: boolean;
  teamMessage?: string;
  onClose: () => void;
  onCreate: () => void;
  onNameChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onAddMember: (userId: string, user: any) => void;
  onRemoveMember: (userId: string) => void;
  getInitials: (name: string) => string;
}

export function CreateTeamDialog({
  isOpen,
  newTeamName,
  newTeamSearch,
  newTeamSearchResults,
  selectedNewUsers,
  creatingTeam,
  teamMessage,
  onClose,
  onCreate,
  onNameChange,
  onSearchChange,
  onAddMember,
  onRemoveMember,
  getInitials,
}: CreateTeamDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
            Create New Team
          </DialogTitle>
          <DialogDescription className="text-[rgb(136,136,136)]">
            Create a team and add members to collaborate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Team Name */}
          <div>
            <Label className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-2">
              Team Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={newTeamName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter team name"
              className="h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(0,0,0)]/10 dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(0,0,0)]/20 dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2.5px_rgb(60,61,60)]/20 dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all placeholder:text-[rgb(136,136,136)]"
            />
          </div>

          {/* Member Search */}
          <div>
            <Label className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-2">
              Add Members <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(136,136,136)]" />
              <Input
                value={newTeamSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by username..."
                className="pl-10 h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(0,0,0)]/10 dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(0,0,0)]/20 dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2.5px_rgb(60,61,60)]/20 dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all placeholder:text-[rgb(136,136,136)]"
              />
            </div>
            {newTeamSearchResults.length === 0 && newTeamSearch.length >= 2 && (
              <div className="flex items-center gap-2 text-[rgb(136,136,136)] py-2 mt-2">
                <X className="h-4 w-4 text-red-500" />
                <span className="text-sm">No user found</span>
              </div>
            )}
            {newTeamSearchResults.length > 0 && (
              <div className="mt-2 bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-md max-h-48 overflow-y-auto">
                {newTeamSearchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => onAddMember(user._id, user)}
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

          {/* Selected Members */}
          {selectedNewUsers.length > 0 && (
            <div>
              <Label className="text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)] mb-2">
                Selected Members ({selectedNewUsers.length})
              </Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {selectedNewUsers.map((member) => (
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
          )}

          {/* Duplicate Team Warning */}
          {teamMessage && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-900/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {teamMessage}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-[1.3px] cursor-pointer"
            disabled={creatingTeam}
          >
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={
              !newTeamName.trim() ||
              selectedNewUsers.length === 0 ||
              creatingTeam ||
              !!teamMessage
            }
            className="border-[1.3px] bg-[rgb(0,0,0)] dark:bg-[rgb(237,237,237)] text-[rgb(255,255,255)] dark:text-[rgb(0,0,0)] hover:bg-[rgb(30,30,30)] dark:hover:bg-[rgb(220,220,220)] disabled:opacity-50 cursor-pointer"
          >
            {creatingTeam ? "Creating..." : "Create Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
