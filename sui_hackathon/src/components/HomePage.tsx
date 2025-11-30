import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { ChatroomList } from "./ChatroomList";
import { useState } from "react";
import { Box, Container, Flex, Heading, TextField, Button } from "@radix-ui/themes";

export function HomePage() {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/profile/${searchQuery.trim()}`);
    }
  };

  const handleMyProfile = () => {
    if (currentAccount?.address) {
      navigate(`/profile/${currentAccount.address}`);
    }
  };

  return (
    <Box style={{ minHeight: "100vh", background: "var(--x-black)" }}>
      {/* Header - X.com style */}
      <Box
        style={{
          background: "var(--x-black)",
          borderBottom: "1px solid var(--x-border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container size="4" py="3" px="4">
          <Flex align="center" justify="between" gap="4">
            <Heading size="7" style={{ color: "var(--x-white)", fontWeight: 700 }}>
              Sui Chat
            </Heading>
            <Flex align="center" gap="3" style={{ flex: 1, maxWidth: 600, marginLeft: "auto" }}>
              <TextField.Root
                placeholder="Search wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                style={{ 
                  flex: 1,
                  background: "var(--x-gray-700)",
                  border: "1px solid var(--x-border)",
                  color: "var(--x-white)",
                }}
              />
              <Button 
                onClick={handleSearch}
                className="x-button-primary"
                style={{ minWidth: "auto" }}
              >
                Search
              </Button>
              {currentAccount?.address && (
                <Button
                  onClick={handleMyProfile}
                  className="x-button-primary"
                  style={{ minWidth: "auto", fontWeight: 600 }}
                >
                  My Profile
                </Button>
              )}
              <ConnectButton />
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="4" py="6" px="4">
        <Flex align="center" justify="between" mb="6">
          <Heading size="5" style={{ color: "var(--x-white)", fontWeight: 700 }}>
            Your Chatrooms
          </Heading>
          <Flex gap="3">
            {currentAccount?.address && (
              <Button 
                onClick={handleMyProfile}
                className="x-button-secondary"
                size="3"
              >
                My Profile
              </Button>
            )}
            <Button 
              onClick={() => navigate("/create")} 
              className="x-button-primary"
              size="3"
            >
              Create Chatroom
            </Button>
          </Flex>
        </Flex>
        <ChatroomList />
      </Container>
    </Box>
  );
}
