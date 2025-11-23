"use client";

import { Label } from "@/components/ui/label";
import {
  CustomRadioGroup,
  CustomRadioItem,
} from "@/components/ui/custom-radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Team } from "@/lib/api";

interface TeamSelectionSectionProps {
  uploadToTeam: "no" | "yes";
  setUploadToTeam: (value: "no" | "yes") => void;
  teamSelection: "existing" | "new";
  setTeamSelection: (value: "existing" | "new") => void;
  isCreatorOfAnyTeam: boolean;
  allTeams: Team[];
  selectedTeamId: string;
  setSelectedTeamId: (value: string) => void;
  currentUserId: string;
  loading: boolean;
  loadingTeams: boolean;
  resetTeamState: () => void;
  children?: React.ReactNode; // For NewTeamForm
}

export function TeamSelectionSection({
  uploadToTeam,
  setUploadToTeam,
  teamSelection,
  setTeamSelection,
  isCreatorOfAnyTeam,
  allTeams,
  selectedTeamId,
  setSelectedTeamId,
  currentUserId,
  loading,
  loadingTeams,
  resetTeamState,
  children,
}: TeamSelectionSectionProps) {
  return (
    <div className="grid gap-3">
      <Label className="text-sm sm:text-base font-medium">
        Upload to a team?
      </Label>
      <CustomRadioGroup
        value={uploadToTeam}
        onValueChange={(value) => {
          setUploadToTeam(value as "no" | "yes");
          resetTeamState();
        }}
        disabled={loading}
      >
        <CustomRadioItem value="no" id="team-no" label="No" />
        <CustomRadioItem value="yes" id="team-yes" label="Yes" />
      </CustomRadioGroup>

      {uploadToTeam === "yes" && (
        <div className="mt-2 space-y-4">
          {/* Team Selection: Existing or New */}
          {isCreatorOfAnyTeam && (
            <CustomRadioGroup
              value={teamSelection}
              onValueChange={(value) =>
                setTeamSelection(value as "existing" | "new")
              }
              disabled={loading}
            >
              <CustomRadioItem
                value="existing"
                id="existing-team"
                label="Use existing team"
              />
              <CustomRadioItem
                value="new"
                id="new-team"
                label="Create new team"
              />
            </CustomRadioGroup>
          )}

          {/* Existing Team Dropdown */}
          {teamSelection === "existing" && isCreatorOfAnyTeam && (
            <div className="pb-4">
              <Label
                htmlFor="team-select"
                className="text-sm sm:text-base font-medium mb-3"
              >
                Select Team
              </Label>
              <Select
                value={selectedTeamId}
                onValueChange={setSelectedTeamId}
                disabled={loading || loadingTeams}
              >
                <SelectTrigger className="h-10 sm:h-11 text-sm sm:text-base !border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] hover:!bg-[rgb(245,245,245)] dark:hover:!bg-[rgb(20,20,20)] focus-visible:border-[rgb(255,255,255)] dark:focus-visible:border-[rgb(255,255,255)]/50 focus-visible:shadow-[0_0_0_2px_rgb(136,136,136)] dark:focus-visible:shadow-[0_0_0_3px_rgb(60,61,60)] focus-visible:outline-none !transition-all">
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent className="!border-[1.3px] !border-[rgb(237,237,237)] dark:!border-[rgb(237,237,237)]/15 !bg-white dark:!bg-[rgb(10,10,10)] !shadow-lg">
                  {allTeams
                    .filter((team) => {
                      const creatorId =
                        typeof team.creator === "string"
                          ? team.creator
                          : team.creator?._id;
                      return creatorId === currentUserId;
                    })
                    .map((team) => (
                      <SelectItem
                        key={team._id}
                        value={team._id}
                        className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-3 pr-3 text-[14px] text-[rgb(102,102,102)] dark:text-[rgb(161,161,161)] outline-none transition-colors hover:!bg-[rgba(0,0,0,0.05)] dark:hover:!bg-[rgba(255,255,255,0.06)] hover:!text-[rgb(23,23,23)] dark:hover:!text-[rgb(237,237,237)] focus:!bg-[rgba(0,0,0,0.05)] dark:focus:!bg-[rgba(255,255,255,0.06)] focus:!text-[rgb(23,23,23)] dark:focus:!text-[rgb(237,237,237)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>span:first-child]:hidden"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* New Team Form */}
          {teamSelection === "new" && children}
        </div>
      )}
    </div>
  );
}
