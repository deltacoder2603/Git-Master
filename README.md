# GitMaster

AI-Powered GitHub Repository Analysis & Q&A

## Overview

**GitMaster** is a modern web application that leverages AI to analyze any public GitHub repository and provides intelligent, context-aware answers to your questions about the codebase. Instantly unlock insights, understand architecture, and explore dependencies with a chat-based interface.

## Features

- **Smart Analysis:** Deep code understanding with AI insights
- **Code Insights:** Instantly comprehend complex codebases
- **Deep Context:** Get answers with full repository context
- **Interactive Chat:** Ask questions and receive detailed, AI-generated responses
- **Modern UI:** Beautiful, responsive design with dark mode support

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **UI:** [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/)
- **State & Forms:** React Hooks, [react-hook-form](https://react-hook-form.com/)
- **Markdown:** [react-markdown](https://github.com/remarkjs/react-markdown)
- **Icons:** [Lucide React](https://lucide.dev/)
- **AI Backend:** Connects to a custom backend API (see below)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm, npm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/gitmaster.git
cd gitmaster

# Install dependencies
pnpm install # or npm install or yarn install
```

### Development

```bash
pnpm dev # or npm run dev or yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Build & Production

```bash
pnpm build # or npm run build or yarn build
pnpm start # or npm start or yarn start
```

## Usage

1. Enter a public GitHub repository URL (e.g., `https://github.com/vercel/next.js`).
2. Click **Analyze** to start the AI-powered analysis.
3. Once complete, you'll be redirected to a chat interface.
4. Ask questions about the repository (e.g., "What is the main architecture?", "What dependencies are used?").

## Folder Structure

```
├── app/                # Next.js app directory (pages, layouts, chat, etc.)
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── public/             # Static assets (images, icons)
├── styles/             # Global and component styles
├── package.json        # Project metadata and scripts
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
```

## Customization

- **Backend API:**
  - The app expects a backend API at `https://git-master-backend.vercel.app` for session management and AI analysis.
  - To use your own backend, update the `API_BASE` constant in `app/page.tsx` and `app/chat/[sessionId]/page.tsx`.
- **Branding:**
  - Replace `public/placeholder-logo.png` and other assets with your own branding.


## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [react-markdown](https://github.com/remarkjs/react-markdown)

---

> _Made with ❤️ by Srikant Pandey
