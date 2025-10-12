# EventTribe Kenya

A modern event management platform for discovering, booking, and managing events in Kenya.

## Project info

**URL**: https://lovable.dev/projects/718058d7-e10f-49b4-baae-566d0765853c

## Features

### Event Discovery
- **Advanced Search**: Search events by title, description, or location
- **Category Filtering**: Filter events by category (Tech, Music, Travel, Parties, Campus, Sports, Art)
- **Price Range Filter**: Set custom price ranges to find events within your budget
- **Free Events Filter**: Toggle to show only free events
- **Smart Sorting**: Sort by date, price (low to high, high to low), or popularity
- **AI-Powered Recommendations**: Personalized event suggestions based on user interests and booking history

### Event Details
- **Capacity Indicators**: Visual progress bars showing event capacity with real-time updates
- **Event Reminders**: Set reminders (1 day, 1 hour, or 30 minutes before event)
- **Social Sharing**: Share events on Twitter, Facebook, WhatsApp, LinkedIn, or copy link
- **Ratings & Reviews**: Rate and review events after attendance
- **Real-time Updates**: Live updates on bookings and event changes
- **Comments & Discussions**: Engage with other attendees
- **Waiting List**: Join waitlist when events are full and get notified when spots open
- **Calendar Integration**: Export events to Google Calendar, Outlook, or download iCal files

### Booking & Tickets
- **Instant Booking**: Quick booking for free events
- **M-Pesa Integration**: Secure payment processing for paid events
- **QR Code Tickets**: Digital tickets with QR codes for easy check-in
- **Booking Confirmation**: Confirmation dialog before finalizing bookings
- **Booking Cancellation**: Cancel bookings for upcoming events with refund processing
- **Group Bookings**: Book multiple tickets at once with automatic group discounts (10% off for 5+ attendees, 15% off for 10+)
- **Early Bird Pricing**: Special discounted pricing for early bookings
- **Real-time Booking Count**: See live updates as people book events

### User Management
- **My Bookings**: View and manage all your event bookings
- **Favorites**: Save events to your favorites list
- **Profile Management**: Update your profile and preferences
- **Notification Preferences**: Customize email, WhatsApp, and SMS notification settings

### Organizer Features
- **Event Analytics Dashboard**: Track views, bookings, shares, and engagement metrics
- **Capacity Management**: Set maximum attendees and monitor capacity in real-time
- **Flexible Pricing**: Support for free events, paid events, early bird pricing, and group discounts
- **Attendee Management**: View and manage event attendees

## Technologies

This project is built with:

- **Frontend**: React, TypeScript, Vite
- **UI Library**: shadcn-ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Realtime)
- **Payment**: M-Pesa API Integration
- **State Management**: React Hooks, TanStack Query

## Recent Enhancements

### Bug Fixes
- Fixed event navigation issue causing "Event not found" errors
- Fixed RLS policies for proper booking count visibility
- Resolved race conditions in event loading
- **Fixed real-time booking count updates** - Booking count now updates live when anyone books an event

### New Features (Latest Release)
- **Waiting List System**: Join waitlist when events are full, with automatic position tracking
- **Group Booking**: Book multiple tickets with automatic discounts (10% for 5+, 15% for 10+ attendees)
- **Calendar Integration**: Export events to Google Calendar, Outlook, or iCal format
- **Event Recommendations**: AI-powered personalized event suggestions based on interests
- **Event Analytics**: Track views, bookings, shares for organizers
- **Early Bird Pricing**: Support for time-limited early bird discounts
- **Enhanced WhatsApp Integration**: Share events and reminders via WhatsApp
- **Real-time Booking Updates**: Live subscription to booking changes

### Previous Features
- Event capacity visual indicators with "Almost full!" warnings
- Booking confirmation dialogs
- Event cancellation with refund notices
- Social media sharing (Twitter, Facebook, WhatsApp, LinkedIn)
- Event reminders (1 day, 1 hour, 30 minutes before)
- Price range filtering
- Multiple sorting options
- Free events filter

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/718058d7-e10f-49b4-baae-566d0765853c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/718058d7-e10f-49b4-baae-566d0765853c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
