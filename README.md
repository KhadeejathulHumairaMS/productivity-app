# Personal Productivity Hub

A comprehensive, responsive web application built with Next.js for managing your daily tasks, goals, notes, books, and finances all in one place.

## Features

### ✅ Todo List
- Add, edit, and delete daily tasks
- Mark tasks as completed
- Set reminders with date and time
- Browser notifications for reminders

### 🎯 Goals Management
- Create separate sections for short-term and long-term goals
- Add images to goals for motivation
- Set reminders for goals
- Edit and delete goals

### 🖼️ Vision Board
- Add motivational images via URL
- Add inspirational quotes
- Edit and delete items
- Beautiful grid layout

### 📝 Notes & Writings
- Create and save personal notes
- Rich text editor
- View all notes in a sidebar
- Edit and delete notes
- Track creation and update dates

### 📚 Books Tracker
- Track books you're reading
- Separate sections for "In Progress" and "Completed"
- Add notes about each book
- Mark books as completed
- Track start and completion dates

### 💰 Financial Tracker
- Track salary income
- Record expenses
- Monitor savings
- Track investments
- View financial summary with net income calculation
- Categorize entries

### 🔔 Reminders & Notifications
- Set reminders for todos and goals
- Browser notifications (requires permission)
- Automatic reminder checking

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **date-fns** - Date formatting and manipulation
- **Supabase** - Cloud database and storage
- **Recharts** - Data visualization for financial charts

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd personal-productivity-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Get your Supabase credentials:
   - Go to [supabase.com](https://supabase.com) and create a free account
   - Create a new project
   - Go to **Settings** → **API**
   - Copy your **Project URL** and **anon/public key**
   - Paste them into your `.env.local` file

6. Set up your Supabase database tables (run these SQL commands in Supabase SQL Editor):
   - See the Supabase setup section below

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Supabase Database Setup

Before running the application, you need to create the database tables in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL scripts to create all required tables:

```sql
-- Todos table
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  reminder TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  reminder TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  type TEXT CHECK (type IN ('short-term', 'long-term'))
);

-- Vision Board table
CREATE TABLE IF NOT EXISTS vision_board (
  id TEXT PRIMARY KEY,
  image_url TEXT,
  quote TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT CHECK (status IN ('completed', 'in-progress')),
  image_url TEXT,
  completed_date TIMESTAMPTZ,
  started_date TIMESTAMPTZ,
  notes TEXT
);

-- Finances table
CREATE TABLE IF NOT EXISTS finances (
  id TEXT PRIMARY KEY,
  type TEXT CHECK (type IN ('salary', 'expense', 'savings', 'investment')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  date TIMESTAMPTZ NOT NULL
);

-- Prayers table
CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  fajr BOOLEAN DEFAULT FALSE,
  dhuhr BOOLEAN DEFAULT FALSE,
  asr BOOLEAN DEFAULT FALSE,
  maghrib BOOLEAN DEFAULT FALSE,
  isha BOOLEAN DEFAULT FALSE
);

-- Quran table
CREATE TABLE IF NOT EXISTS quran (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  surah TEXT NOT NULL,
  verses TEXT NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE
);
```

**Note:** For initial setup, Row Level Security (RLS) is disabled. You can enable it later for better security.

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy your Next.js application. Follow these steps:

#### 1. Push Your Code to GitHub

Make sure your code is pushed to a GitHub repository:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login (you can use your GitHub account)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project

#### 3. Configure Environment Variables

**IMPORTANT:** You need to add your Supabase credentials:

1. In the Vercel project settings, go to **"Environment Variables"**
2. Add these two variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
     - Value: `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
     - Value: Your publishable key from Supabase

3. Click **"Save"**

#### 4. Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy your application
3. Once complete, you'll get a live URL (e.g., `https://your-app.vercel.app`)

#### 5. Update Supabase Settings (Optional)

If you want to restrict access to your Supabase database:
- Go to your Supabase project dashboard
- Navigate to **Settings** → **API**
- Add your Vercel domain to allowed origins (if using Row Level Security)

### Alternative Deployment Options

#### Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables (same as Vercel)
6. Click **"Deploy site"**

#### Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Add environment variables in the project settings
5. Railway will automatically deploy

### Environment Variables Required

Make sure these are set in your deployment platform:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** Never commit your `.env.local` file to GitHub. These variables should only be set in your deployment platform's settings.

## Usage

### Navigation
- On desktop: Use the sidebar navigation on the left
- On mobile: Tap the menu icon (☰) in the top-left corner to open the navigation drawer

### Data Storage
All data is stored in Supabase (cloud database). This means:
- Your data is synced across all devices
- Data persists in the cloud
- Access your data from anywhere
- Secure and reliable cloud storage

### Browser Notifications
To enable reminders:
1. When you first set a reminder, your browser will ask for notification permission
2. Click "Allow" to enable notifications
3. You'll receive notifications when reminders are due

## Responsive Design

The application is fully responsive and works seamlessly on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1280px+)

## Dark Mode

The application automatically adapts to your system's dark mode preference.

## Project Structure

```
personal-productivity-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Todos page (home)
│   ├── goals/             # Goals page
│   ├── vision-board/      # Vision Board page
│   ├── notes/             # Notes page
│   ├── books/             # Books tracker page
│   ├── finances/          # Financial tracker page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   └── Navigation.tsx     # Navigation sidebar
├── lib/                   # Utilities
│   ├── types.ts           # TypeScript type definitions
│   └── storage.ts          # LocalStorage utilities
└── public/                # Static assets
```

## Future Enhancements

Potential features for future versions:
- Export/import data functionality
- Cloud sync capabilities
- Advanced analytics and reports
- Recurring tasks and goals
- Calendar view
- Search functionality
- Tags and categories

## License

This project is open source and available for personal use.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

---

Built with ❤️ using Next.js and TypeScript
