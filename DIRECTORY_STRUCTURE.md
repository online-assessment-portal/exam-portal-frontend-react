# Exam Portal App - Directory Structure

This document outlines the recommended directory structure for the Exam Portal React application. The structure is designed for scalability, maintainability, and clear separation of concerns.

## Overview

```
src/
├── assets/           # Static assets (images, icons, fonts)
│   ├── images/
│   ├── icons/
│   └── fonts/
├── components/       # Reusable UI components organized by role/feature
│   ├── common/       # Shared components across all roles (buttons, modals, inputs)
│   ├── layout/       # Layout components (navbar, sidebar, footer)
│   ├── ui/           # Basic UI elements (cards, badges, icons)
│   ├── admin/        # Admin-specific components (exam controls, user management)
│   ├── proctor/      # Proctor-specific components (monitoring tools, alerts)
│   ├── exam/         # Exam-related components (timer, question display, code editor)
│   └── user/         # User-specific components (profile, results display)
├── pages/            # Page-level components organized by user roles
│   ├── User/         # User-facing pages
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Exam/
│   │   ├── Profile/
│   │   └── Result/
│   ├── Admin/        # Admin dashboard pages
│   │   ├── Dashboard/
│   │   ├── ExamAdmin/
│   │   ├── Monitor/
│   │   ├── QBankPrepare/
│   │   └── InviteComp/
│   ├── Proctor/      # Proctor dashboard pages
│   │   ├── Dashboard/
│   │   ├── Monitor/
│   │   └── Report/
│   └── Shared/       # Shared pages (e.g., Error, NotFound)
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
│   ├── api.js        # API calls
│   ├── helpers.js    # Helper functions
│   └── constants.js  # Constants
├── styles/           # Styles organized by scope and role
│   ├── global/       # Global styles
│   │   ├── index.css     # Global reset and base styles
│   │   ├── variables.css # CSS variables (colors, fonts, spacing)
│   │   └── themes/       # Theme-specific styles (light, dark)
│   ├── components/   # Component-specific styles
│   │   ├── common.css    # Shared component styles
│   │   ├── admin.css     # Admin component styles
│   │   ├── proctor.css   # Proctor component styles
│   │   └── exam.css      # Exam component styles
│   └── pages/        # Page-specific styles
│       ├── user.css      # User page styles
│       ├── admin.css     # Admin page styles
│       └── proctor.css   # Proctor page styles
├── contexts/         # React contexts (auth, theme, etc.)
├── services/         # External service integrations
└── main.jsx          # App entry point
```

## Directory Explanations

### `assets/`

Contains static files like images, icons, and fonts. This keeps media files organized and separate from code.

### `components/`

Reusable UI components organized by role and feature for better maintainability:

- `common/`: Shared components used across all user roles (buttons, modals, inputs, loading spinners).
- `layout/`: Layout components that define the app's structure (navbar, sidebar, footer, breadcrumbs).
- `ui/`: Basic UI elements and design system components (cards, badges, icons, tooltips).
- `admin/`: Admin-specific components (exam creation forms, user management tables, analytics charts).
- `proctor/`: Proctor-specific components (live monitoring panels, alert systems, candidate tracking).
- `exam/`: Exam-related components (question display, code editor, timer, submission forms).
- `user/`: User-specific components (profile settings, result displays, progress indicators).

### `pages/`

Page-level components organized by user roles for better separation of concerns:

- `User/`: Pages for end-users (candidates taking exams).
- `Admin/`: Pages for administrators managing the system.
- `Proctor/`: Pages for proctors monitoring exams.
- `Shared/`: Common pages like error pages or authentication flows.

Each role-based directory contains subdirectories for specific pages, with each page having its own folder for the component, styles, and tests.

### `hooks/`

Custom React hooks for shared logic (e.g., `useAuth`, `useLocalStorage`).

### `utils/`

Utility functions and helpers:

- `api.js`: Centralized API calls and configurations.
- `helpers.js`: General helper functions.
- `constants.js`: App-wide constants.

### `styles/`

Styles organized by scope and role to maintain consistency and avoid conflicts:

- `global/`: Global styles applied across the entire application.
  - `index.css`: Global CSS reset, base styles, and utilities.
  - `variables.css`: CSS custom properties for colors, fonts, spacing, and other design tokens.
  - `themes/`: Theme-specific stylesheets (light, dark, high contrast).
- `components/`: Styles for specific components, organized by role/feature.
  - `common.css`: Styles for shared components.
  - `admin.css`: Styles for admin-specific components.
  - `proctor.css`: Styles for proctor-specific components.
  - `exam.css`: Styles for exam-related components.
- `pages/`: Page-specific styles to override component styles when needed.
  - `user.css`: Styles for user-facing pages.
  - `admin.css`: Styles for admin pages.
  - `proctor.css`: Styles for proctor pages.

### `contexts/`

React Context providers for global state management (e.g., authentication, theme).

### `services/`

Integrations with external services (e.g., analytics, payment gateways).

### `main.jsx`

The entry point for the React application, where the app is rendered to the DOM.

## Implementation Plan

### Phase 1: Create Directory Structure

```bash
# Create main directories
mkdir -p src/assets/{images,icons,fonts}
mkdir -p src/components/{common,layout,ui,admin,proctor,exam,user}
mkdir -p src/pages/{User/{Home,Login,Exam,Profile,Result},Admin/{Dashboard,ExamAdmin,Monitor,QBankPrepare,InviteComp},Proctor/{Dashboard,Monitor,Report},Shared}
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/styles/{global/themes,components,pages}
mkdir -p src/contexts
mkdir -p src/services
```

### Phase 2: File Migration Mapping

#### Current → New Structure

- `src/admin/` → `src/components/admin/` + `src/pages/Admin/`
- `src/login/` → `src/pages/User/Login/` + `src/components/user/`
- `src/result/` → `src/pages/User/Result/` + `src/components/user/`
- `src/helpers/` → `src/lib/`
- Static assets → `src/assets/`
- CSS files → `src/styles/`

#### Specific File Moves

```
# Admin Components
src/admin/ExamAdmin.js → src/pages/Admin/ExamAdmin/index.jsx
src/admin/monitor.js → src/pages/Admin/Monitor/index.jsx
src/admin/QBankPrepare.js → src/pages/Admin/QBankPrepare/index.jsx
src/admin/inviteComp.js → src/pages/Admin/InviteComp/index.jsx

# User Components
src/login/AuthPage.js → src/pages/User/Login/index.jsx
src/result/ResultMain.js → src/pages/User/Result/index.jsx
src/home.jsx → src/pages/User/Home/index.jsx

# Shared Components
src/ExamComp.js → src/pages/User/Exam/index.jsx
src/navbar.js → src/components/layout/Navbar.jsx

# Utilities
src/helpers/ → src/lib/
src/common.js → src/lib/common.js

# Assets
src/*.png, *.svg → src/assets/images/

# Styles
src/*.css → src/styles/components/ or src/styles/pages/
```

### Phase 3: Update Import Paths

- Update all import statements to reflect new file locations
- Use absolute imports with path mapping in vite.config.js
- Create index.js files for cleaner imports

### Phase 4: Class-to-Hooks Migration

#### Migration Strategy

```
# Create hooks directory structure
mkdir -p src/hooks/{auth,exam,admin,user,common}

# Class component → Hooks migration mapping
Class Components → Function Components + Custom Hooks
componentDidMount → useEffect
componentDidUpdate → useEffect with dependencies
componentWillUnmount → useEffect cleanup
this.state → useState
this.setState → useState setter
```

#### Hooks Organization

```
src/hooks/
├── common/           # Shared hooks across all roles
│   ├── useLocalStorage.js
│   ├── useDebounce.js
│   ├── useToggle.js
│   └── useApi.js
├── auth/             # Authentication hooks
│   ├── useAuth.js
│   ├── useLogin.js
│   └── usePermissions.js
├── exam/             # Exam-related hooks
│   ├── useTimer.js
│   ├── useExamState.js
│   ├── useQuestionNav.js
│   └── useCodeEditor.js
├── admin/            # Admin-specific hooks
│   ├── useExamAdmin.js
│   ├── useUserManagement.js
│   └── useMonitoring.js
└── user/             # User-specific hooks
    ├── useProfile.js
    ├── useResults.js
    └── useExamHistory.js
```

#### Migration Benefits

- **Smaller bundle size** - Function components are lighter
- **Better performance** - React.memo and useMemo optimization
- **Reusable logic** - Custom hooks can be shared
- **Modern patterns** - Aligns with React best practices
- **Testing friendly** - Easier to test hooks in isolation

### Phase 5: Next.js Migration Preparation

#### Additional Directories for Next.js

```
public/           # Move from existing public/ (already exists)
lib/              # Rename from utils/
middleware.js     # New - Route protection
next.config.js    # New - Next.js configuration
types/            # TypeScript definitions
components/providers/  # Context providers wrapper
```

#### Next.js Specific Structure

```
app/ (App Router) or pages/ (Pages Router)
├── (auth)/       # Route groups for authentication
├── admin/        # Admin routes with middleware protection
├── proctor/      # Proctor routes
├── user/         # User routes
├── api/          # API routes
└── globals.css   # Global styles
```

## Enhanced Directory Structure

```
src/
├── assets/           # Static assets
│   ├── images/       # Images, logos, backgrounds
│   ├── icons/        # SVG icons, favicons
│   └── fonts/        # Custom fonts
├── components/       # Reusable UI components
│   ├── common/       # Shared components (Button, Modal, Input)
│   ├── layout/       # Layout components (Navbar, Sidebar, Footer)
│   ├── ui/           # Basic UI elements (Card, Badge, Spinner)
│   ├── admin/        # Admin-specific components
│   ├── proctor/      # Proctor-specific components
│   ├── exam/         # Exam components (Timer, QuestionDisplay, CodeEditor)
│   ├── user/         # User components (Profile, Results)
│   └── providers/    # Context providers wrapper
├── pages/            # Page components by role
│   ├── User/
│   │   ├── Home/
│   │   ├── Login/
│   │   ├── Exam/
│   │   ├── Profile/
│   │   └── Result/
│   ├── Admin/
│   │   ├── Dashboard/
│   │   ├── ExamAdmin/
│   │   ├── Monitor/
│   │   ├── QBankPrepare/
│   │   └── InviteComp/
│   ├── Proctor/
│   │   ├── Dashboard/
│   │   ├── Monitor/
│   │   └── Report/
│   └── Shared/       # Error, NotFound, Loading
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers (renamed from utils)
│   ├── api.js        # API configurations
│   ├── auth.js       # Authentication utilities
│   ├── helpers.js    # General helpers
│   ├── constants.js  # App constants
│   └── validations.js # Form validations
├── types/            # TypeScript definitions
├── styles/           # Organized styles
│   ├── global/
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── themes/
│   ├── components/
│   └── pages/
├── contexts/         # React contexts
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── ExamContext.jsx
├── services/         # External services
│   ├── examService.js
│   ├── userService.js
│   └── analyticsService.js
└── main.jsx          # App entry point
```

## Implementation Steps

1. **Create directories** using the bash commands above
2. **Move files** according to the mapping
3. **Update imports** in all components
4. **Add index files** for cleaner imports
5. **Configure path mapping** in vite.config.js
6. **Test application** functionality
7. **Prepare for Next.js** migration

## Benefits

- **Scalability**: Easy to add new features and components
- **Maintainability**: Clear separation of concerns
- **Team Collaboration**: Developers can work on specific roles/features
- **Next.js Ready**: Structure aligns with Next.js best practices
- **Type Safety**: Ready for TypeScript integration
- **Performance**: Better code splitting and lazy loading opportunities

This structure will make your exam portal more maintainable and ready for future Next.js migration.
