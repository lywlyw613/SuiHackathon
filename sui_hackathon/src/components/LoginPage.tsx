import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Flex, Heading, Text, Button, Separator, Card } from "@radix-ui/themes";
import { useZkLogin } from "../hooks/useZkLogin";
import { getZkLoginAccount } from "../lib/zklogin-account";

export function LoginPage() {
  const account = useCurrentAccount();
  const navigate = useNavigate();
  const { handleGoogleLogin, isLoading: zkLoginLoading } = useZkLogin();
  const zkAccount = getZkLoginAccount();

  useEffect(() => {
    // Redirect if user has wallet connected OR zkLogin account
    if (account || zkAccount) {
      navigate("/home");
    }
  }, [account, zkAccount, navigate]);

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
          <Flex align="center" justify="center">
            <Heading size="7" style={{ color: "var(--x-white)", fontWeight: 700 }}>
              Sui Chat
            </Heading>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="3" py="8" px="4">
        <Flex direction="column" align="center" justify="center" style={{ minHeight: "60vh" }}>
          <Card
            style={{
              maxWidth: 500,
              width: "100%",
              background: "var(--x-black)",
              border: "1px solid var(--x-border)",
              padding: "var(--x-spacing-xl)",
            }}
          >
            <Flex direction="column" gap="6" align="center">
              <Box style={{ textAlign: "center" }}>
                <Heading size="8" style={{ color: "var(--x-white)", fontWeight: 700, marginBottom: "var(--x-spacing-sm)" }}>
                  Welcome to Sui Chat
                </Heading>
                <Text size="4" style={{ color: "var(--x-text-secondary)", display: "block" }}>
                  Encrypted chat on Sui Chain
                </Text>
              </Box>

              <Flex direction="column" gap="4" style={{ width: "100%" }}>
                {/* Connect Wallet */}
                <Box>
                  <Text 
                    size="3" 
                    weight="medium" 
                    style={{ 
                      display: "block", 
                      color: "var(--x-white)",
                      marginBottom: "var(--x-spacing-md)",
                    }}
                  >
                    Connect Wallet
                  </Text>
                  <Flex justify="center">
                    <ConnectButton />
                  </Flex>
                </Box>

                <Separator 
                  size="4" 
                  style={{ 
                    background: "var(--x-border)",
                    margin: "var(--x-spacing-md) 0",
                  }} 
                />

                {/* Google Sign In */}
                <Box>
                  <Text 
                    size="3" 
                    weight="medium" 
                    style={{ 
                      display: "block", 
                      color: "var(--x-white)",
                      marginBottom: "var(--x-spacing-md)",
                    }}
                  >
                    Sign in with Google (zkLogin)
                  </Text>
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={zkLoginLoading}
                    className="x-button-primary"
                    style={{ 
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "var(--x-spacing-sm)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {zkLoginLoading ? "Loading..." : "Sign in with Google"}
                  </Button>
                </Box>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Container>
    </Box>
  );
}
