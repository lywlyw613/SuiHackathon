import { ConnectButton } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { ChatroomList } from "./ChatroomList";
import { useState } from "react";
import { Box, Container, Flex, Heading, TextField, Button } from "@radix-ui/themes";

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/profile/${searchQuery.trim()}`);
    }
  };

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-2)" }}>
      {/* Header */}
      <Box
        style={{
          background: "var(--gray-3)",
          borderBottom: "1px solid var(--gray-6)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container size="4" py="4" px="4">
          <Flex align="center" justify="between" gap="4">
            <Heading size="7">Sui Chat</Heading>
            <Flex align="center" gap="3" style={{ flex: 1, maxWidth: 600, marginLeft: "auto" }}>
              <TextField.Root
                placeholder="Search wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ flex: 1 }}
              />
              <Button onClick={handleSearch}>Search</Button>
              <ConnectButton />
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="4" py="6" px="4">
        <Flex align="center" justify="between" mb="6">
          <Heading size="5">Your Chatrooms</Heading>
          <Button onClick={() => navigate("/create")} size="3">
            Create Chatroom
          </Button>
        </Flex>
        <ChatroomList />
      </Container>
    </Box>
  );
}
