import { useState, useEffect } from "react";

/**
 * Simplified hook: Get members from chat history
 * This is used in ChatroomDetail where we already have the chats
 */
export function useMembersFromChats(chats: Array<{ sender: string }>) {
  const [members, setMembers] = useState<string[]>([]);

  useEffect(() => {
    const uniqueSenders = new Set<string>();
    chats.forEach((chat) => {
      uniqueSenders.add(chat.sender);
    });
    setMembers(Array.from(uniqueSenders));
  }, [chats]);

  return members;
}

