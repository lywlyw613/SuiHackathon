export interface KeyObject {
  objectId: string;
  chatroomId: string;
  key: Uint8Array;
}

export interface ChatroomData {
  objectId: string;
  creator: string;
  lastChatId: string | null;
  createdAt: number;
}

export interface ChatData {
  objectId: string;
  chatroomId: string;
  sender: string;
  timestamp: number;
  previousChatId: string | null;
  encryptedContent: Uint8Array;
  decryptedContent?: string; // Decrypted on client side
}

export interface UserProfile {
  address: string;
  chatroomKeys: KeyObject[];
}

