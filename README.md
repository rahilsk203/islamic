# IslamicAI Frontend

This is the React frontend for IslamicAI, an Islamic Scholar assistant powered by AI.

## Features

- Chat interface with IslamicAI
- Session management
- Location detection for prayer times
- Islamic resource navigation (Quran, Hadith, Seerah)
- Responsive design for all devices

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- React Router
- TanStack Query

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher) - This project should be built with npm, not yarn or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd clone-my-app-mate
   ```

3. Install dependencies with npm:
   ```bash
   npm install
   ```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build:

```bash
npm run build
```

### Previewing Production Build

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom hooks
├── lib/            # Utility functions
├── pages/          # Page components
├── App.tsx         # Main App component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Configuration

The frontend connects to the IslamicAI backend at `https://islamicai.sohal70760.workers.dev`. You can modify this URL in the `src/pages/Index.tsx` file.

## Deployment

This project is configured for deployment to Cloudflare Pages. Make sure to use npm for building the project to avoid lockfile conflicts.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.