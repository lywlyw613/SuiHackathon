/**
 * zkLogin utilities for Google OAuth
 * 
 * Note: zkLogin requires a proving service and salt service.
 * For hackathon purposes, we'll use a simplified approach.
 */

// zkLogin utilities for Google OAuth
// Note: Full zkLogin requires proving service and salt service

/**
 * Generate ephemeral key pair for zkLogin
 * Note: This is a simplified version. Full implementation requires @mysten/sui/cryptography
 */
export function generateEphemeralKeyPair() {
  // For hackathon, we'll use a simplified approach
  // Full implementation would use Ed25519Keypair from @mysten/sui/cryptography
  const keypair = crypto.getRandomValues(new Uint8Array(32));
  return {
    privateKey: keypair,
    publicKey: keypair, // Simplified
  };
}

/**
 * Get Google OAuth URL
 */
export function getGoogleOAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "id_token",
    scope: "openid email profile",
    nonce: generateNonce(),
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Generate a random nonce
 */
function generateNonce(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Parse JWT token (simplified, for demo purposes)
 */
export function parseJWT(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

