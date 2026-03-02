# Credit Risk MVP - Project Structure

## 📁 Root Directory

```
credit-risk-mvp/
├── app/                    # Next.js 16 App Router directory
├── components/             # React components
├── lib/                    # Utility functions, types, and shared code
├── hooks/                  # Custom React hooks
├── public/                 # Static assets (images, icons)
├── styles/                 # Additional styles (legacy/unused)
├── node_modules/           # Dependencies
├── .next/                  # Next.js build output
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.mjs         # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
├── components.json         # shadcn/ui component configuration
└── .gitignore              # Git ignore rules
```

---

## 📂 app/ - Next.js App Router

The `app` directory uses Next.js 16 App Router for file-based routing.

```
app/
├── layout.tsx              # Root layout (wraps all pages)
├── page.tsx                # Home page (redirects to /dashboard)
├── globals.css             # Global styles and Tailwind CSS theme variables
│
├── dashboard/
│   └── page.tsx           # Dashboard page - Main overview
│
├── applications/
│   ├── page.tsx           # Applications list page
│   └── [id]/
│       └── page.tsx       # Dynamic route - Application detail page
│
├── apply/
│   └── page.tsx           # New application form page
│
├── login/
│   └── page.tsx           # Login page
│
└── settings/
    └── page.tsx           # Settings page
```

**Key Routes:**
- `/` → Redirects to `/dashboard`
- `/dashboard` → Main dashboard with statistics
- `/applications` → List of all applications
- `/applications/[id]` → Individual application details
- `/apply` → New application form
- `/login` → Authentication page
- `/settings` → User settings

---

## 🧩 components/ - React Components

### Core Feature Components

```
components/
├── applicant-sidebar.tsx        # Sidebar showing applicant information
├── application-header.tsx       # Header for application detail pages
├── applications-table.tsx       # Table displaying all applications
├── audit-trail-drawer.tsx      # Drawer showing audit trail events
├── confidence-indicator.tsx    # Component showing model confidence
├── data-provenance-inspector.tsx # Inspector for data sources
├── explainability-breadcrumbs.tsx # Breadcrumbs for explainability flow
├── explainability-panel.tsx    # Panel showing feature contributions
├── main-nav.tsx                # Main navigation header
├── provenance-badge.tsx        # Badge showing data provenance
├── risk-glyph.tsx              # Circular glyph showing risk score
├── risk-summary-card.tsx       # Card summarizing risk assessment
├── scenario-sandbox.tsx        # Interactive scenario testing component
├── stats-card.tsx              # Dashboard statistics card
├── theme-provider.tsx          # Theme context provider (dark/light mode)
└── theme-toggle.tsx            # Theme toggle button/dropdown
```

### UI Components Library (`components/ui/`)

shadcn/ui component library with 60+ reusable components:

```
components/ui/
├── button.tsx              # Button component
├── card.tsx                # Card container
├── input.tsx               # Input field
├── table.tsx               # Table component
├── dialog.tsx              # Modal dialog
├── drawer.tsx              # Slide-out drawer
├── dropdown-menu.tsx       # Dropdown menu
├── select.tsx              # Select dropdown
├── slider.tsx              # Range slider
├── tabs.tsx                # Tab navigation
├── toast.tsx               # Toast notifications
├── tooltip.tsx             # Tooltip
├── ... (50+ more components)
```

---

## 📚 lib/ - Libraries and Utilities

```
lib/
├── types.ts                # TypeScript type definitions
│                           # - Applicant, CreditReport, IncomeData
│                           # - LoanRequest, RiskAssessment
│                           # - FeatureContribution, DataProvenance
│                           # - AuditEvent, ScenarioInput, Application
│
├── mock-data.ts            # Mock data for development
│                           # - Sample applications
│                           # - Default scenario inputs
│
└── utils.ts                # Utility functions
                            # - cn() - className merger (clsx + tailwind-merge)
```

---

## 🎣 hooks/ - Custom React Hooks

```
hooks/
├── use-mobile.ts           # Hook to detect mobile devices
└── use-toast.ts            # Hook for toast notifications
```

---

## 🎨 public/ - Static Assets

```
public/
├── icon.svg                # App icon (SVG)
├── icon-light-32x32.png    # Light theme icon
├── icon-dark-32x32.png     # Dark theme icon
├── apple-icon.png          # Apple touch icon
├── placeholder-logo.png    # Placeholder logo
├── placeholder-logo.svg    # Placeholder logo (SVG)
├── placeholder-user.jpg    # Default user avatar
├── placeholder.jpg         # Generic placeholder image
└── placeholder.svg         # Generic placeholder (SVG)
```

---

## ⚙️ Configuration Files

### Core Configuration

- **`package.json`** - Dependencies and npm scripts
  - Next.js 16.0.10
  - React 19.2.0
  - TypeScript 5
  - Tailwind CSS 4.1.9
  - Radix UI components
  - Framer Motion (animations)
  - Recharts (charts)

- **`tsconfig.json`** - TypeScript compiler options
  - Strict mode enabled
  - Path aliases: `@/*` → `./*`

- **`next.config.mjs`** - Next.js configuration
  - TypeScript errors ignored in build (for development)
  - Images unoptimized

- **`postcss.config.mjs`** - PostCSS configuration
  - Tailwind CSS plugin

- **`components.json`** - shadcn/ui configuration
  - Component styling preferences

---

## 🎯 Key Features

### 1. **Credit Risk Assessment**
   - Risk scoring (0-1000)
   - Risk tier classification (low/medium/high/critical)
   - Probability of default calculation

### 2. **Explainability**
   - Feature contribution analysis (SHAP values)
   - Explainability panel with feature importance
   - Model confidence indicators

### 3. **Data Provenance**
   - Data source tracking
   - Verification status
   - Raw vs transformed values

### 4. **Audit Trail**
   - Complete event logging
   - User actions tracking
   - System events

### 5. **Scenario Sandbox**
   - Interactive risk scenario testing
   - What-if analysis
   - Real-time score simulation

### 6. **Application Management**
   - Application listing
   - Detailed application views
   - New application form

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Component Library**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Theme**: next-themes (dark/light mode)
- **Icons**: Lucide React

---

## 🚀 Scripts

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📝 Notes

- The project uses mock data (`lib/mock-data.ts`) for development
- TypeScript strict mode is enabled
- Dark mode is supported via next-themes
- All components are client components (use "use client" directive)
- The app uses file-based routing with Next.js App Router

