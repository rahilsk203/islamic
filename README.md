# IslamicAI Frontend

This is the frontend application for IslamicAI, a React-based chat interface for interacting with the IslamicAI backend.

## Features

- Real-time chat interface with IslamicAI
- User authentication (Login/Signup)
- Google Sign-In integration
- Personalized preferences (language, madhhab, interests)
- Session management with local storage
- Message editing and regeneration
- Typing indicators and smooth scrolling

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd islamic
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

The frontend is configured to connect to the backend at `http://127.0.0.1:8787` by default. To change this:

1. Update the `BACKEND_URL` in `src/pages/Index.tsx`
2. Update the `BACKEND_URL` in `src/contexts/AuthContext.tsx`
3. Update the `BACKEND_URL` in `src/App.tsx`

For Google Sign-In, you need to:

1. Create a Google OAuth client ID in the Google Cloud Console
2. Update the client ID in:
   - `src/components/AuthModal.tsx`

## Authentication

The frontend supports three authentication methods:

1. **Email/Password**: Traditional signup and login
2. **Google Sign-In**: OAuth integration with Google accounts

### User Preferences

Authenticated users can set preferences that enhance their experience:

- **Language**: Choose from English, Hindi, Bengali, or Hinglish
- **Madhhab**: Select your preferred school of Islamic jurisprudence
- **Interests**: Specify topics of interest (e.g., Fiqh, Tafsir, Islamic history)

## Development

### Project Structure

```
src/
├── components/     # React components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
└── App.tsx         # Main application component
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

## Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## API Integration

The frontend communicates with the IslamicAI backend through the following endpoints:

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - Authenticate existing user
- `POST /auth/google` - Google Sign-In

### User Preferences
- `POST /prefs/update` - Update user preferences
- `POST /prefs/clear` - Clear specific preference
- `GET /memory/profile` - Get user profile and preferences
- `POST /memory/clear` - Clear all user memories

### Chat
- `POST /` - Send message and get response
- `GET /health` - Check backend health

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.