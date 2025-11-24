# Tuition Rider

![Tuition Rider Logo](public/icons/whatsapp.svg)

A modern platform connecting students with qualified home tutors and online tutoring services.

## 🌟 Features

- **Student-Tutor Matching**: Post learning requirements and connect with qualified tutors
- **User Authentication**: Secure login and registration with Supabase
- **Admin Dashboard**: Manage users, resources, and tutoring requests
- **Resource Management**: Upload and download educational resources
- **Responsive UI**: Beautiful, modern interface that works on all devices
- **WhatsApp Integration**: Instant communication with tutors

## 📋 Table of Contents

- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Project Structure](#-project-structure)
- [Features in Detail](#-features-in-detail)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🛠️ Technology Stack

- **Frontend**: React.js, Next.js 15.2.3
- **Styling**: Tailwind CSS, Shadcn UI components
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **API**: Next.js API Routes
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/Raahul-01/tution_rider.git
cd tution_rider
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables (see section below)

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Configuration
ADMIN_USERNAME=admin_username
ADMIN_PASSWORD=admin_password

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📁 Project Structure

```
tuition-rider/
├── app/                    # Next.js app directory (pages, components)
│   ├── (marketing)/        # Public-facing pages (landing, about, etc.)
│   ├── admin/              # Admin dashboard pages and components
│   ├── api/                # API routes for backend functionality
│   ├── auth/               # Authentication pages
│   ├── components/         # Reusable UI components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   ├── sections/       # Section components for landing pages
│   │   ├── shared/         # Shared components
│   │   └── ui/             # UI component library
│   └── lib/                # Utility functions and hooks
├── public/                 # Static assets
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
└── next.config.js          # Next.js configuration
```

## 🔍 Features in Detail

### Home Tutoring Service
- Students can post their learning requirements
- Tutors can browse and respond to student requirements
- Real-time matching based on subject, location, and expertise

### User Roles
- **Admin**: Manage all aspects of the platform
- **Student**: Post requirements, browse tutors
- **Tutor**: Create profile, respond to requirements

### Dashboard
- **Admin Dashboard**: User management, content management
- **User Dashboard**: Profile management, saved tutors/students

### Educational Resources
- Downloadable study materials
- Subject-wise organized content
- Search and filter functionality

## 📦 Deployment

### Deploying to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy with default settings

### Manual Deployment
For manual deployment, build the project:
```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created with ❤️ by [Rahul Kumar Verma](https://github.com/Raahul-01) 