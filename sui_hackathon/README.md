# Sui Chat - Encrypted Chat on Sui Chain

A decentralized encrypted chat application built on Sui blockchain.

## Features

- 🔐 **Encrypted Messages** - AES-256-GCM encryption for all messages
- 🔗 **Blockchain Storage** - All messages stored on-chain with chain-linked structure
- 🔑 **Key Management** - Each chatroom member has a Key object for access control
- 👤 **User Profiles** - View wallet addresses and their chatroom access
- 🔍 **Search** - Search for users by wallet address
- 🔐 **zkLogin** - Sign in with Google (OAuth)

## Tech Stack

- **Frontend**: React + Vite + Radix UI
- **Blockchain**: Sui Move
- **Wallet**: @mysten/dapp-kit
- **Encryption**: Web Crypto API (AES-256-GCM)

## Setup

### Prerequisites

- Node.js 18+
- Sui CLI
- A Sui wallet

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Contract

The Move contract is deployed on devnet:
- Package ID: `0x85000de160853d9a4938f91925b9ff0ea55c7e21211be7cf72c921a973525baf`

## Deployment

### Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Google OAuth Setup

1. Get Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://your-vercel-url.vercel.app` (production)
3. Set `VITE_GOOGLE_CLIENT_ID` in environment variables

## Project Structure

```
sui_hackathon/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities (crypto, zklogin, etc.)
│   ├── types/          # TypeScript types
│   └── App.tsx         # Main app component
└── move/               # Move smart contracts
```

## License

MIT
