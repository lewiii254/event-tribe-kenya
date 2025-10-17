<div align="center">

# 🎊 EventTribe Kenya

### *Your Complete Event Management & Discovery Platform*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Lovable Cloud](https://img.shields.io/badge/Lovable-Cloud-blueviolet?style=for-the-badge)](https://lovable.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**🚀 Discover · 🎫 Book · 📊 Manage · 🎉 Celebrate**

[Live Demo](https://lovable.dev/projects/718058d7-e10f-49b4-baae-566d0765853c) · [Report Bug](https://github.com/lewiii254/event-tribe-kenya/issues) · [Request Feature](https://github.com/lewiii254/event-tribe-kenya/issues)

</div>

---

## 📖 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [💡 Usage Guide](#-usage-guide)
- [📊 How It Works](#-how-it-works)
- [🔌 API & Integrations](#-api--integrations)
- [🎯 Use Cases](#-use-cases)
- [🌈 Future Enhancements](#-future-enhancements)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [💬 Support](#-support)

---

## 🌟 Overview

**EventTribe Kenya** is a modern, comprehensive event management platform built with cutting-edge web technologies. It connects event organizers with attendees through an intuitive, real-time platform featuring advanced booking, payment processing, analytics, and community engagement tools.

### 🎯 Mission

To revolutionize event management in Kenya by providing a seamless, technology-driven platform that empowers organizers and delights attendees through innovative features and exceptional user experience.

### ⚡ Why EventTribe Kenya?

- 🚀 **Real-time Everything** - Live booking updates, instant notifications, dynamic capacity tracking
- 💰 **Smart Pricing** - Multi-tier tickets, discount codes, early bird pricing, group discounts
- 📱 **Mobile-First Design** - Beautiful, responsive UI optimized for all devices
- 🔐 **Enterprise Security** - Row-level security, encrypted data, secure M-Pesa payments
- 📊 **Powerful Analytics** - Comprehensive dashboards with visual charts and insights
- 🎟️ **Advanced Ticketing** - QR codes, waitlists, multiple ticket types, check-in system

---

## ✨ Key Features

### 👥 For Event Attendees

#### 🔍 Discovery & Browsing
- 🎯 **Smart Search** - Advanced filtering by category, location, price, and date
- 📅 **Calendar View** - Visualize events in an organized calendar layout
- ⭐ **Favorites System** - Save events to your favorites for easy access
- 🔔 **Waitlist** - Join waitlists for sold-out events and get notified when spots open
- 🎭 **Category Browsing** - Explore events by category (Music, Tech, Sports, Travel, Party)

#### 🎫 Booking & Tickets
- ⚡ **Quick Booking** - Streamlined checkout process for fast reservations
- 🎟️ **Multiple Ticket Types** - Choose from various ticket tiers and pricing options
- 💵 **Discount Codes** - Apply promotional codes for special pricing
- 👥 **Group Discounts** - Automatic discounts for bulk purchases
- 📱 **M-Pesa Payments** - Secure mobile money integration
- 🎫 **QR Code Tickets** - Digital tickets with QR codes for easy check-in
- 💾 **Download Tickets** - Save tickets as PDF or images

#### 📱 Engagement Features
- ⭐ **Ratings & Reviews** - Share your experience and help others decide
- 💬 **Comments** - Engage with other attendees in event discussions
- 👍 **Event Likes** - Show appreciation for events you love
- 📤 **Social Sharing** - Share events on Twitter, Facebook, WhatsApp, LinkedIn
- 📅 **Calendar Export** - Add to Google Calendar, Outlook, or download iCal

### 🎪 For Event Organizers

#### 📊 Analytics Dashboard
- 📈 **Performance Metrics** - Track views, bookings, revenue, and engagement
- 📉 **Visual Charts** - Line and bar charts for trend analysis (powered by Recharts)
- 🎯 **Conversion Tracking** - Monitor booking conversion rates
- 📅 **Timeline Analysis** - View performance over custom date ranges
- 💰 **Revenue Insights** - Track earnings and payment status breakdown

#### 🎛️ Event Management
- ✅ **QR Check-in** - Fast attendee verification with QR scanner
- 👥 **Attendee Lists** - View and manage all registered participants
- 💰 **Financial Tracking** - Budget management with revenue and expense tracking
- 📋 **Capacity Management** - Set limits and monitor real-time availability
- 🎫 **Ticket Types** - Create multiple ticket tiers with different pricing
- 💸 **Discount Codes** - Generate and manage promotional codes
- 📊 **Waitlist Management** - View and notify waitlisted users

#### 💸 Pricing & Discounts
- 🎟️ **Multi-tier Tickets** - Create different ticket types (VIP, Regular, Early Bird)
- 🏷️ **Discount Codes** - Set up percentage or fixed amount discounts
- ⏰ **Time-based Pricing** - Configure valid date ranges for discounts
- 🔢 **Usage Limits** - Control how many times codes can be used
- 👥 **Group Discounts** - Automatic discounts for bulk bookings

### 🔐 Admin Features

#### 👨‍💼 User Management
- 👥 **Role Assignment** - Assign admin, organizer, or user roles
- 📋 **User Oversight** - View all users and their assigned roles
- 🔒 **Access Control** - Row-level security with role-based permissions

#### 🎪 Event Moderation
- 👁️ **Event Oversight** - View all events across the platform
- 🗑️ **Event Management** - Delete events that violate policies
- 📊 **Platform Analytics** - Monitor overall platform health and metrics

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  Mobile PWA  │  │  Admin Panel │          │
│  │  (React/TS)  │  │ (Responsive) │  │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API & INTEGRATION LAYER                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Lovable    │  │   M-Pesa     │  │  Calendar    │          │
│  │    Cloud     │  │  Payment API │  │   Services   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                       │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Real-time Updates │ Booking Management │ Analytics │       │
│  │  Payment Processing │ Notifications │ Security      │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Real-time   │  │  Edge        │          │
│  │   Database   │  │  Subscriptions│  │  Functions   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Database Schema

#### Core Tables
- **events** - Event information, pricing, capacity, organizer details
- **bookings** - Ticket purchases with payment status and QR codes
- **profiles** - User profiles with username and bio
- **user_roles** - Role-based access control (admin, organizer, user)

#### Engagement Tables
- **event_ratings** - User ratings and reviews
- **comments** - Event discussions
- **event_likes** - Event appreciation tracking
- **event_favorites** - Saved events per user
- **event_views** - View count analytics
- **event_waitlist** - Waitlist management for full events

#### Ticketing & Pricing
- **ticket_types** - Multiple ticket tiers per event
- **discount_codes** - Promotional codes with usage limits
- **seating_charts** - Venue layout configurations
- **seats** - Individual seat management

#### Financial Management
- **event_budgets** - Budget tracking (revenue vs expenses)
- **event_expenses** - Expense categorization and tracking

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ **React 18** - Modern UI library with hooks and concurrent features
- 📘 **TypeScript** - Type-safe development with full IDE support
- ⚡ **Vite** - Lightning-fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - Beautiful, accessible component library
- 📊 **Recharts** - Composable charting library
- 🔄 **TanStack Query** - Powerful async state management
- 🎯 **React Hook Form** - Performant form handling
- 🎨 **Lucide React** - Beautiful icon library

### Backend & Cloud
- ☁️ **Lovable Cloud** - Full-stack cloud platform (Supabase-powered)
  - PostgreSQL Database
  - Authentication & Authorization
  - Real-time Subscriptions
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Secrets Management
- 🔐 **Row Level Security** - Database-level access control
- 🌐 **RESTful API** - Auto-generated from database schema

### Payment & Integrations
- 💰 **M-Pesa API** - Mobile money payment gateway
  - STK Push for payment initiation
  - Callback handling for verification
  - Transaction status tracking
- 📅 **Calendar Integration** - Google Calendar, Outlook, iCal export
- 📱 **Social Sharing** - Twitter, Facebook, WhatsApp, LinkedIn

### Development Tools
- 📦 **npm/bun** - Package management
- 🔍 **ESLint** - Code linting and quality
- 🎯 **TypeScript ESLint** - TypeScript-specific rules
- 🔧 **PostCSS** - CSS processing

### Deployment
- 🚀 **Lovable Platform** - One-click deployment
- 🌐 **Custom Domains** - Connect your own domain
- 📈 **Auto-scaling** - Automatic traffic handling
- ⚡ **Edge Functions** - Serverless logic at the edge

---

## 🚀 Getting Started

### Prerequisites

- 📦 **Node.js** (v18 or higher)
- 📥 **npm** or **bun** package manager
- 🔑 **Lovable Account** (for Cloud features)
- 💳 **M-Pesa Developer Account** (optional, for payment testing)

### Installation

#### Method 1: Using Lovable (Recommended)

1. Visit the [Lovable Project](https://lovable.dev/projects/718058d7-e10f-49b4-baae-566d0765853c)
2. Fork or remix the project
3. Start customizing via prompts
4. Deploy with one click

#### Method 2: Local Development

```bash
# 1. Clone the repository
git clone https://github.com/lewiii254/event-tribe-kenya.git

# 2. Navigate to project directory
cd event-tribe-kenya

# 3. Install dependencies
npm install
# or
bun install

# 4. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 5. Start development server
npm run dev
# or
bun run dev

# 6. Open in browser
# Visit http://localhost:5173
```

### Environment Setup

The project uses Lovable Cloud, so most configuration is automatic. However, for M-Pesa integration, you'll need:

```env
# M-Pesa Configuration (Optional)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
```

### Database Setup

The database is automatically provisioned via Lovable Cloud with:
- ✅ All tables and relationships
- ✅ Row Level Security policies
- ✅ Database functions and triggers
- ✅ Realtime subscriptions enabled

---

## 💡 Usage Guide

### For Attendees

#### Discovering Events
1. Browse homepage for featured events
2. Use category filters (Music, Tech, Sports, etc.)
3. Search by keyword or location
4. View calendar for date-based browsing
5. Save favorites for quick access

#### Booking Tickets
1. Click on event card to view details
2. Select ticket type and quantity
3. Apply discount code if available
4. Choose M-Pesa for payment (or free booking)
5. Receive QR ticket via email/download

#### Managing Bookings
1. Navigate to "My Bookings"
2. View all purchased tickets
3. Download QR codes
4. Check event details and updates
5. Add to calendar or set reminders

### For Organizers

#### Creating Events
1. Click "Create Event" from dashboard
2. Fill in event details (title, description, location)
3. Set date, time, and capacity
4. Upload event image
5. Configure pricing and ticket types
6. Publish event

#### Managing Events
1. Access "Organizer Dashboard"
2. View all your events
3. Monitor analytics (views, bookings, revenue)
4. Check in attendees via QR scanner
5. Track finances and budgets
6. Manage waitlists and notify users

#### Analytics & Insights
1. Select event from dashboard
2. View performance charts
3. Track daily/weekly trends
4. Monitor payment status
5. Export attendee lists

### For Admins

#### User Management
1. Access "Admin Panel"
2. View all users and roles
3. Assign roles (admin, organizer, user)
4. Monitor user activity

#### Platform Oversight
1. View all events across platform
2. Moderate content if needed
3. Delete inappropriate events
4. Monitor platform health

---

## 📊 How It Works

### Booking Flow

```
User Browses Events
       ↓
Selects Event & Ticket Type
       ↓
Applies Discount Code (optional)
       ↓
Initiates M-Pesa Payment / Free Booking
       ↓
Payment Verified
       ↓
QR Ticket Generated
       ↓
Confirmation Sent (Email/SMS)
       ↓
Event Day → QR Check-in
```

### Real-time Updates

1. **Event Creation** → Database insert → Real-time broadcast to all clients
2. **Booking Made** → Capacity update → Live UI refresh → Organizer notification
3. **Event Modified** → Change detection → Push to subscribers → UI update
4. **Waitlist Spot Opens** → Alert users → Auto-notification → Booking opportunity

### Payment Processing

1. User initiates booking → M-Pesa STK Push triggered
2. User enters M-Pesa PIN on phone
3. Payment processed → Callback received
4. Booking confirmed → QR ticket generated
5. Confirmation sent → Email/SMS delivery

---

## 🔌 API & Integrations

### Lovable Cloud API

```typescript
// Authentication
const { user } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure_password'
})

// Fetch events
const { data: events } = await supabase
  .from('events')
  .select('*, profiles(username), bookings(count)')
  .order('date', { ascending: true })

// Create booking
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    event_id: eventId,
    user_id: userId,
    ticket_type_id: ticketTypeId,
    final_price: calculatedPrice
  })
```

### M-Pesa Edge Function

```typescript
// Initiate STK Push
const response = await fetch('/functions/v1/mpesa-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '254712345678',
    amount: 1000,
    accountReference: 'EVENT-123'
  })
})
```

### Real-time Subscriptions

```typescript
// Subscribe to booking updates
const channel = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    // Update UI with new booking
    console.log('New booking:', payload)
  })
  .subscribe()
```

---

## 🎯 Use Cases

### 🎤 Tech Conferences
- High capacity management (1000+ attendees)
- Multiple ticket tiers (Early Bird, VIP, Regular)
- Group discounts for teams
- Analytics for sponsor ROI

### 🎵 Music Festivals
- Social sharing for viral reach
- Real-time capacity updates
- Fast QR check-in
- Waitlist for sold-out shows

### 🎓 Campus Events
- Free event support
- Student group discounts
- Calendar integration
- Budget tracking for clubs

### 💼 Corporate Events
- Professional analytics dashboards
- Expense tracking
- Custom pricing tiers
- Secure payment processing

### 🎨 Art Exhibitions
- Limited capacity management
- Timed entry slots
- Member pricing
- Gallery location mapping

---

## 🌈 Future Enhancements

### 🚀 Planned Features

#### Q1-Q2 2026
- [ ] **Mobile Apps** - Native iOS and Android apps
- [ ] **Multi-language Support** - Swahili, English, French
- [ ] **Dark Mode** - Complete dark theme
- [ ] **Advanced Analytics** - Predictive analytics and forecasting
- [ ] **Email Campaigns** - Built-in email marketing

#### Q3-Q4 2026
- [ ] **Live Streaming** - Virtual and hybrid events
- [ ] **NFT Tickets** - Blockchain-based tickets
- [ ] **AI Recommendations** - Personalized event suggestions
- [ ] **Networking Features** - In-app attendee matching
- [ ] **White Label** - Fully branded platform option

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Ways to Contribute
1. 🐛 Report bugs via [Issues](https://github.com/lewiii254/event-tribe-kenya/issues)
2. 💡 Suggest features
3. 📖 Improve documentation
4. 🔧 Submit pull requests
5. 🎨 Contribute designs

### Development Workflow

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/event-tribe-kenya.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

### Commit Convention

```
type(scope): subject

feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: tests
chore: maintenance
```

---

## 📝 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

---

## 💬 Support

### Get Help
- 📧 **Email**: support@eventtribekenya.com
- 💬 **Discussions**: [GitHub Discussions](https://github.com/lewiii254/event-tribe-kenya/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/lewiii254/event-tribe-kenya/issues)

### Community
- 🐦 **Twitter**: [@EventTribeKE](https://twitter.com/EventTribeKE)
- 📘 **Facebook**: [EventTribe Kenya](https://facebook.com/eventtribekenya)
- 📸 **Instagram**: [@eventtribekenya](https://instagram.com/eventtribekenya)

---

## 🙏 Acknowledgments

- 🎨 **shadcn/ui** - Beautiful component library
- ☁️ **Lovable** - Cloud platform and deployment
- ⚛️ **React Team** - Amazing framework
- 💚 **Open Source Community** - Inspiration and tools
- 🇰🇪 **Kenya** - Our home and inspiration

---

<div align="center">

### 🎊 Made with ❤️ in Kenya 🇰🇪

**EventTribe Kenya** - *Connecting Communities Through Events*

[![Deploy to Lovable](https://img.shields.io/badge/Deploy%20to-Lovable-blueviolet?style=for-the-badge)](https://lovable.dev/projects/718058d7-e10f-49b4-baae-566d0765853c)

[⬆ Back to Top](#-eventtribe-kenya)

---

**⭐ Star this repo if you find it helpful!**

</div>
