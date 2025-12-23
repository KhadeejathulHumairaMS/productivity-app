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
- **LocalStorage** - Client-side data persistence

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

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage

### Navigation
- On desktop: Use the sidebar navigation on the left
- On mobile: Tap the menu icon (☰) in the top-left corner to open the navigation drawer

### Data Storage
All data is stored locally in your browser's localStorage. This means:
- Your data stays on your device
- No account or login required
- Data persists between sessions
- Clear browser data will remove all stored information

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
