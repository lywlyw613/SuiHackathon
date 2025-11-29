/**
 * Sponsored Transactions utilities
 * 
 * For hackathon demo, we'll use a simple approach:
 * - Option 1: Use a sponsor address (if available)
 * - Option 2: Call backend API to sponsor transactions
 */

import { Transaction } from "@mysten/sui/transactions";

/**
 * Set sponsor for a transaction
 * This allows another address to pay for gas fees
 * 
 * @param tx Transaction to sponsor
 * @param sponsorAddress Address that will pay for gas (optional, defaults to env var)
 */
export function setSponsor(
  tx: Transaction,
  sponsorAddress?: string
): Transaction {
  const sponsor = sponsorAddress || import.meta.env.VITE_SPONSOR_ADDRESS;
  
  if (sponsor) {
    // Set the sponsor address - this address will pay for gas
    // Note: The sponsor must sign the transaction separately
    // For full implementation, you'd need a backend service
    tx.setGasPayment([
      {
        objectId: sponsor, // This would need to be a coin object ID
        version: "0", // This is a placeholder
        digest: "0x0", // This is a placeholder
      },
    ]);
  }
  
  return tx;
}

/**
 * Check if sponsored transactions are enabled
 */
export function isSponsoredTransactionsEnabled(): boolean {
  return !!import.meta.env.VITE_SPONSOR_ADDRESS || !!import.meta.env.VITE_SPONSOR_API_URL;
}

/**
 * Get sponsor API URL if available
 */
export function getSponsorApiUrl(): string | null {
  return import.meta.env.VITE_SPONSOR_API_URL || null;
}

