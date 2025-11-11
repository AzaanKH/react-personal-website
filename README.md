# Azaan Khalfe - Portfolio Website

A modern, responsive portfolio website built with React, showcasing projects, skills, and professional experience with integrated Steam gaming profile.

## 🚀 Features

- **Modern React 18** with Vite for lightning-fast development
- **Responsive Bento Grid Design** with adaptive layouts
- **Dark/Light Theme** with smooth transitions and localStorage persistence
- **Steam Integration** displaying real-time gaming profile and recent games
- **Animated Transitions** using Framer Motion for smooth UI interactions
- **Contact Form** with EmailJS integration and rate limiting
- **Serverless Backend** with Netlify Functions
- **Accessibility Focused** with semantic HTML and ARIA labels

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **Vite 5.4.10** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Framer Motion** - Animation library
- **Lucide React** - Icon system

### Backend & Services
- **Netlify Functions** - Serverless API endpoints
- **EmailJS** - Email service for contact form
- **Steam Web API** - Gaming profile integration
- **Upstash Redis** - Rate limiting for contact form

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd my-portfolio

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
# Edit .env and add your API keys
```

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Steam Integration
STEAM_API_KEY=your_steam_api_key
STEAM_ID=your_steam_id

# EmailJS
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Getting API Keys

**Steam API Key:**
1. Visit [Steam Web API](https://steamcommunity.com/dev/apikey)
2. Register for an API key
3. Find your Steam ID at [SteamID Finder](https://steamidfinder.com/)

**EmailJS:**
1. Create account at [EmailJS](https://www.emailjs.com/)
2. Set up email service and template
3. Get your public key, service ID, and template ID

**Upstash Redis:**
1. Create account at [Upstash](https://upstash.com/)
2. Create a Redis database
3. Copy REST URL and token from dashboard

## 🚦 Development

```bash
# Start Vite dev server (port 3000)
npm run dev

# Start with Netlify Dev (recommended - includes functions)
# Runs on port 8888
netlify dev

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing

```bash
# Run Steam API tests
npm run test:steam

# Run Steam tests in development mode
npm run test:steam:dev
```

## 📁 Project Structure

```
my-portfolio/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Feature components
│   ├── config/           # Configuration files
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── ...               # CSS and main files
├── netlify/functions/    # Serverless functions
├── public/               # Static assets
└── ...                   # Config files
```

## 🎨 Layout System

The portfolio uses an adaptive layout system with three modes:

- **TRADITIONAL**: Classic portfolio layout
- **BENTO**: Full bento grid design
- **HYBRID**: Bento grid for About, traditional cards for Projects (current)

Change layout in `src/config/layoutConfig.js`:

```javascript
layoutConfig.currentLayout = LAYOUT_TYPES.HYBRID;
```

## 🚀 Deployment

### Netlify (Recommended)

1. Connect repository to Netlify
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive project documentation, architecture, and Steam integration guide
- **[CODE_REVIEW.md](./CODE_REVIEW.md)** - Detailed code review findings and recommendations
- **[STEAM_SETUP.md](./STEAM_SETUP.md)** - Steam API integration setup guide

## 🔧 Key Components

### SteamBentoCard
Displays real-time Steam profile with:
- User avatar and online status
- Recent games with cycling display
- Playtime statistics
- Fallback for missing data

### BentoAboutEnhanced
Enhanced bento grid with:
- Bio and education
- Technical skills
- Current reading progress
- Professional goals
- Contact options

### ContactFormShadcn
Contact modal featuring:
- Form validation
- EmailJS integration
- Rate limiting protection
- Animated success/error states

## 🎯 Performance

- Optimized bundle size with code splitting
- Lazy loading for images
- Memoization for expensive operations
- Efficient re-render prevention
- Caching for Steam API responses

## 🐛 Troubleshooting

### Netlify Functions Not Found (404)
**Solution:** Use `netlify dev` instead of `npm run dev`

The Vite dev server runs on port 3000 and doesn't include Netlify Functions. Always use `netlify dev` which runs on port 8888 and includes both the frontend and serverless functions.

### Steam Component Not Loading
1. Check environment variables are set correctly
2. Test functions at `http://localhost:8888/steam-direct-test.html`
3. Verify Steam API key is valid
4. Check browser console for errors

### Theme Flickering
Minor white flash on initial load in dark mode - this is expected behavior and doesn't impact functionality.

## 🎯 Performance

### **Bundle Size**
- **Current:** ~450KB (optimized)
- **Previous:** ~950KB
- **Reduction:** 52.6% (500KB saved!)

### **Load Times**
- **Steam Data:** <50ms (cached) vs 500-1000ms (uncached)
- **Initial Page Load:** ~1.2s
- **Time to Interactive:** ~1.8s

### **Caching**
- localStorage caching with 5-minute TTL
- Stale-while-revalidate strategy
- Offline support for cached data
- Background revalidation

## 📈 Recent Improvements (v2.0.0)

### ✅ Completed (January 2025)
- **SEO Optimization:** Added comprehensive meta tags for better search visibility
- **Dependency Cleanup:** Removed 484 unused packages (-500KB bundle size)
- **Error Handling:** Global ErrorBoundary component with graceful recovery
- **Caching System:** localStorage caching for instant Steam data loads
- **Code Organization:** Archived unused components and test scripts
- **Documentation:** Complete project documentation and code review

### 📊 Impact
- 52.6% bundle size reduction
- 50% faster npm install times
- Near-instant Steam data loading
- Better error resilience
- Comprehensive documentation

See [CHANGELOG.md](./CHANGELOG.md) for complete details.

## 📄 License

This project is open source and available for personal and educational use.

## 👤 Author

**Azaan Khalfe**
- Portfolio: [azaankhalfe.netlify.app](https://azaankhalfe.netlify.app)
- LinkedIn: [Azaan Khalfe](https://www.linkedin.com/in/azaan-khalfe-43b90b221/)
- GitHub: [@AzaanKH](https://github.com/AzaanKH)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) for the component library
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Netlify](https://www.netlify.com) for hosting and serverless functions

---

**Version:** 2.0.0
**Last Updated:** January 11, 2025
**Status:** ✅ Production Ready | 🚀 Optimized | 📚 Well Documented
