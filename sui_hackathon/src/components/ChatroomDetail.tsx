import { useParams, useNavigate } from "react-router-dom";
import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import { PACKAGE_ID, MODULE_NAMES } from "../lib/constants";
import { encryptMessage } from "../lib/crypto";
import { ChatData, KeyObject } from "../types";
import { formatAddress } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Box, Flex, Text, Button, TextField, Card } from "@radix-ui/themes";

export function ChatroomDetail() {
  const { chatroomId } = useParams<{ chatroomId: string }>();
  const navigate = useNavigate();
  const account = useCurrentAccount();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [key, setKey] = useState<KeyObject | null>(null);
  const [chats] = useState<ChatData[]>([]);
  const [previousChatId, setPreviousChatId] = useState<string | null>(null);

  // Fetch user's Key for this chatroom
  const { data: ownedObjects } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULE_NAMES.KEY}::Key`,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!account && !!chatroomId,
    }
  );

  // Find the key for this chatroom
  useEffect(() => {
    if (ownedObjects?.data && chatroomId) {
      for (const obj of ownedObjects.data) {
        if (obj.data?.content && "fields" in obj.data.content) {
          const fields = obj.data.content.fields as {
            chatroom_id: string;
            key: string;
          };
          if (fields.chatroom_id === chatroomId) {
            try {
              // Key is stored as hex string, convert to Uint8Array
              const hexKey = fields.key;
              const keyBytes = new Uint8Array(
                hexKey.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
              );
              setKey({
                objectId: obj.data.objectId,
                chatroomId: fields.chatroom_id,
                key: keyBytes,
              });
            } catch (e) {
              console.error("Error parsing key:", e);
            }
            break;
          }
        }
      }
    }
  }, [ownedObjects, chatroomId]);

  // Fetch Chatroom to get last_chat_id
  const { data: chatroomData } = useSuiClientQuery(
    "getObject",
    {
      id: chatroomId!,
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!chatroomId,
    }
  );

  // Update previousChatId when chatroom updates
  useEffect(() => {
    if (chatroomData?.data?.content && "fields" in chatroomData.data.content) {
      const fields = chatroomData.data.content.fields as {
        last_chat_id: { fields?: { id: string } } | null;
      };
      setPreviousChatId(fields.last_chat_id?.fields?.id || null);
    }
  }, [chatroomData]);

  // Fetch and decrypt chats
  // TODO: Implement chain traversal to fetch all chats

  if (!key) {
    return (
      <Box p="8" style={{ textAlign: "center" }}>
        <Text size="4" color="gray" mb="4" style={{ display: "block" }}>
          You don't have access to this chatroom
        </Text>
        <Button onClick={() => navigate("/home")} size="3">
          Go Back
        </Button>
      </Box>
    );
  }

  const handleSend = async () => {
    if (!message.trim() || !key || !previousChatId || isSending) return;

    setIsSending(true);
    try {
      // Encrypt message
      const encrypted = await encryptMessage(message, key.key);
      const encryptedHex = Array.from(encrypted)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // TODO: Call send_message function
      console.log("Sending message:", {
        chatroomId,
        previousChatId,
        encryptedHex,
      });

      setMessage("");
      // Refresh chats after sending
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Flex direction="column" style={{ height: "100vh", background: "var(--gray-2)" }}>
      {/* Header */}
      <Box
        style={{
          background: "var(--gray-3)",
          borderBottom: "1px solid var(--gray-6)",
          padding: "var(--space-4)",
        }}
      >
        <Flex align="center" gap="4">
          <Button variant="ghost" onClick={() => navigate("/home")}>
            ← Back
          </Button>
          <Text size="4" weight="medium">
            Chatroom {formatAddress(chatroomId || "")}
          </Text>
        </Flex>
      </Box>

      {/* Messages */}
      <Box style={{ flex: 1, overflowY: "auto", padding: "var(--space-4)" }}>
        {chats.length === 0 ? (
          <Box style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <Text size="4" color="gray">
              No messages yet. Start the conversation!
            </Text>
          </Box>
        ) : (
          <Flex direction="column" gap="4">
            {chats.map((chat) => (
              <Flex
                key={chat.objectId}
                justify={chat.sender === account?.address ? "end" : "start"}
              >
                <Card
                  style={{
                    maxWidth: "70%",
                    background:
                      chat.sender === account?.address
                        ? "var(--blue-9)"
                        : "var(--gray-4)",
                  }}
                >
                  <Text size="3">{chat.decryptedContent || "..."}</Text>
                  <Text size="1" color="gray" style={{ display: "block", marginTop: "var(--space-1)" }}>
                    {formatDistanceToNow(new Date(chat.timestamp), {
                      addSuffix: true,
                    })}
                  </Text>
                </Card>
              </Flex>
            ))}
          </Flex>
        )}
      </Box>

      {/* Input */}
      <Box
        style={{
          background: "var(--gray-3)",
          borderTop: "1px solid var(--gray-6)",
          padding: "var(--space-4)",
        }}
      >
        <Flex gap="2">
          <TextField.Root
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            disabled={isSending}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSend} disabled={!message.trim() || isSending} size="3">
            {isSending ? "Sending..." : "Send"}
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
}
