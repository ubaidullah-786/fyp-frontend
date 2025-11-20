"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, X, Search } from "lucide-react";

interface User {
  _id: string;
  name: string;
  username: string;
  photo?: string;
}

interface NewTeamFormProps {
  newTeamName: string;
  setNewTeamName: (value: string) => void;
  memberSearch: string;
  searchMembers: (query: string) => void;
  searchResults: User[];
  searching: boolean;
  selectedUsers: User[];
  addMember: (user: User) => void;
  removeMember: (userId: string) => void;
  teamMessage: string;
  loading: boolean;
}

export function NewTeamForm({
  newTeamName,
  setNewTeamName,
  memberSearch,
  searchMembers,
  searchResults,
  searching,
  selectedUsers,
  addMember,
  removeMember,
  teamMessage,
  loading,
}: NewTeamFormProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4 p-4 bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] rounded-lg border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15">
      <div className="pb-2">
        <Label htmlFor="team-name" className="text-sm sm:text-base">
          Team Name
        </Label>
        <Input
          id="team-name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onFocus={(e) => e.target.select()}
          disabled={loading}
          className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all"
        />
      </div>

      <div className="pb-2">
        <Label htmlFor="member-search" className="text-sm sm:text-base">
          Add Members
        </Label>
        <div className="relative mt-1.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(136,136,136)]" />
          <Input
            id="member-search"
            placeholder="Search username..."
            value={memberSearch}
            onChange={(e) => searchMembers(e.target.value)}
            disabled={loading}
            className="pl-10 h-10 sm:h-11 text-sm sm:text-base border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 bg-white dark:bg-[rgb(10,10,10)] hover:border-[rgb(245,245,245)] dark:hover:border-[rgb(245,245,245)]/20 focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none transition-all placeholder:text-[rgb(237,237,237)] dark:placeholder:text-[rgb(136,136,136)]"
          />
        </div>

        {searchResults.length === 0 &&
          memberSearch.length >= 2 &&
          !searching && (
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
                type="button"
                onClick={() => addMember(user)}
                className="w-full flex items-center gap-2 p-2 hover:bg-[rgb(237,237,237)] dark:hover:bg-[rgb(237,237,237)]/10 transition-colors cursor-pointer"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.photo} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
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

      {selectedUsers.length > 0 && (
        <div>
          <Label className="text-sm">
            Selected Members ({selectedUsers.length})
          </Label>
          <div className="mt-2 space-y-2">
            {selectedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-2 bg-white dark:bg-[rgb(10,10,10)] rounded-md"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photo} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-[rgb(0,0,0)] dark:text-[rgb(237,237,237)]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[rgb(136,136,136)]">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(user._id)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {teamMessage && (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500/30">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm">
            {teamMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
