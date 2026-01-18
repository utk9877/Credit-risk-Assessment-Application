# Credit Risk MVP

A Next.js-based credit risk assessment dashboard with explainable AI features.

## Project Structure

All frontend code has been moved to the `frontend/` directory.

## Getting Started

You can run commands from the root directory or from the frontend directory:

### From Root Directory (Recommended)

```bash
npm run install:frontend  # Install dependencies in frontend directory
npm run dev               # Start development server
```

### From Frontend Directory

```bash
cd frontend
npm install  # if you haven't installed dependencies yet
npm run dev
```

## Available Scripts

Run these from the root directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run install:frontend` - Install dependencies in frontend directory

## Directory Structure

```
credit-risk-mvp/
├── frontend/           # Frontend code (Next.js)
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities and types
│   ├── hooks/         # Custom React hooks
│   ├── public/        # Static assets
│   └── ...
├── backend/            # Backend code (to be implemented)
│   └── README.md      # Backend documentation
└── README.md          # This file
```

