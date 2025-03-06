import { GroupMember } from "@/utils/types";
import { create } from "zustand";

interface GroupMembersState {
  members: GroupMember[];
  setMembers: (members: GroupMember[]) => void;
  removeMember: (memberId: string) => void;
  updateMemberRole: (
    memberId: string,
    role: "Instructor" | "Moderator" | "Member"
  ) => void;
}

export const useGroupMembersStore = create<GroupMembersState>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((member) => member.id !== memberId),
    })),
  updateMemberRole: (memberId, role) =>
    set((state) => ({
      members: state.members.map((member) =>
        member.id === memberId ? { ...member, role } : member
      ),
    })),
}));
