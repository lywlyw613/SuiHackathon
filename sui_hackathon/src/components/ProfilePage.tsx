import { useParams, useNavigate } from "react-router-dom";
import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { PACKAGE_ID, MODULE_NAMES } from "../lib/constants";
import { formatAddress } from "../lib/utils";
import { KeyObject } from "../types";
import { Box, Container, Flex, Heading, Text, Card, Button, Spinner } from "@radix-ui/themes";

export function ProfilePage() {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();

  // Fetch profile user's Key objects
  const { data: ownedObjects, isLoading } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: address!,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULE_NAMES.KEY}::Key`,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!address,
    }
  );

  // Fetch current user's Key objects to find common chatrooms
  const { data: myOwnedObjects } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: currentAccount?.address as string,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULE_NAMES.KEY}::Key`,
      },
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!currentAccount && !!address,
    }
  );

  const profileKeys: KeyObject[] = [];
  const myKeys: KeyObject[] = [];

  if (ownedObjects?.data) {
    for (const obj of ownedObjects.data) {
      if (obj.data?.content && "fields" in obj.data.content) {
        const fields = obj.data.content.fields as {
          chatroom_id: string;
          key: string;
        };
        profileKeys.push({
          objectId: obj.data.objectId,
          chatroomId: fields.chatroom_id,
          key: new Uint8Array(), // Don't need the actual key for display
        });
      }
    }
  }

  if (myOwnedObjects?.data) {
    for (const obj of myOwnedObjects.data) {
      if (obj.data?.content && "fields" in obj.data.content) {
        const fields = obj.data.content.fields as {
          chatroom_id: string;
          key: string;
        };
        myKeys.push({
          objectId: obj.data.objectId,
          chatroomId: fields.chatroom_id,
          key: new Uint8Array(),
        });
      }
    }
  }

  // Find common chatrooms
  const myChatroomIds = new Set(myKeys.map((k) => k.chatroomId));

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
        <Spinner size="3" />
      </Flex>
    );
  }

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-2)" }}>
      <Container size="4" py="8" px="4">
        {/* Header */}
        <Card mb="6">
          <Button variant="ghost" onClick={() => navigate("/home")} mb="4">
            ← Back
          </Button>
          <Flex align="center" gap="4">
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "var(--blue-9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            >
              {formatAddress(address || "").slice(0, 2).toUpperCase()}
            </Box>
            <Box>
              <Heading size="7">{formatAddress(address || "")}</Heading>
              <Text size="2" color="gray">
                Wallet Address
              </Text>
            </Box>
          </Flex>
        </Card>

        {/* Chatrooms Section */}
        <Card>
          <Heading size="5" mb="4">
            Chatrooms ({profileKeys.length})
          </Heading>

          {profileKeys.length === 0 ? (
            <Text color="gray">No chatrooms</Text>
          ) : (
            <Flex direction="column" gap="2">
              {profileKeys.map((key) => {
                const isCommon = myChatroomIds.has(key.chatroomId);
                return (
                  <Card
                    key={key.objectId}
                    style={{
                      background: isCommon ? "var(--blue-3)" : "var(--gray-3)",
                      border: isCommon ? "1px solid var(--blue-6)" : "1px solid var(--gray-6)",
                      cursor: isCommon ? "pointer" : "default",
                    }}
                    onClick={() => {
                      if (isCommon) {
                        navigate(`/chatroom/${key.chatroomId}`);
                      }
                    }}
                  >
                    <Flex align="center" justify="between">
                      <Box>
                        <Text size="3" weight="medium" style={{ display: "block" }}>
                          {formatAddress(key.chatroomId)}
                        </Text>
                        {isCommon && (
                          <Text size="2" color="blue" style={{ display: "block", marginTop: "var(--space-1)" }}>
                            You both have access - Click to view
                          </Text>
                        )}
                      </Box>
                      {isCommon && <Text color="blue">→</Text>}
                    </Flex>
                  </Card>
                );
              })}
            </Flex>
          )}
        </Card>
      </Container>
    </Box>
  );
}
