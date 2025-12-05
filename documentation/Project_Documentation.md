# Ginicoe Application Documentation

## Overview

Ginicoe is a comprehensive web application built with Next.js that provides specialized dashboards and forms for different types of users including consumers, merchants, financial institutions, government agencies, healthcare providers, and educational institutions. The application features dynamic form generation, address verification, payment processing capabilities, and advanced security features.

## 🏗️ Project Structure

```
ginicoe-app/
├── src/
│   ├── app/
│   │   ├── api/                      # API routes
│   │   │   ├── smarty-autocomplete/  # Address autocomplete API
│   │   │   └── verify-recaptcha/     # reCAPTCHA verification
│   │   ├── dashboard/                # User-specific dashboards
│   │   │   ├── consumer/            # Consumer dashboard
│   │   │   ├── education/           # Education institution dashboard
│   │   │   ├── financial-institutions/ # Financial institution dashboard
│   │   │   ├── govt/                # Government dashboard
│   │   │   ├── healthcare/          # Healthcare dashboard
│   │   │   └── merchant/            # Merchant dashboard
│   │   ├── PageComponents/          # Reusable UI components
│   │   └── Resources/               # Utility functions and data
│   └── script/                      # Data processing scripts
├── public/                          # Static assets
│   ├── agreements/                  # Legal documents and agreements
│   └── pdfjs-dist/                 # PDF.js library for document viewing
└── Documentation files
```

## 🚀 Key Features

### Multi-User Dashboard System
- **Consumer Dashboard**: Personal financial management and verification
- **Merchant Dashboard**: Business account management and payment processing
- **Financial Institution Dashboard**: Banking and financial services management
- **Government Dashboard**: Regulatory compliance and verification
- **Healthcare Dashboard**: Medical institution management
- **Education Dashboard**: Educational institution administration

### Dynamic Form System
- Universal form component (`DynamicComponent`) that renders different input types
- Supported input types:
  - Text fields with validation
  - Dropdown menus (static and dynamic)
  - Toggle switches
  - Social Security Number (SSN) inputs
  - EIN (Employer Identification Number) inputs
  - Telephone number inputs
  - Geolocation components
  - PDF viewers
  - File uploads
  - Checklists and multi-select options

### Security & Verification Features
- Google reCAPTCHA Enterprise integration
- Address verification with SmartyStreets API
- Content sanitization and validation
- Blocked terms filtering
- Input length restrictions
- Face scanning capabilities (FaceScanHud component)

### Address & Location Services
- Google Maps API integration
- HERE Geolocation services
- Auto-complete address suggestions
- Address validation and verification

### Document Management
- PDF viewing and processing
- Legal document storage (agreements, signage)
- Excel file processing for job listings and data import
- Document download capabilities

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.3.5** - React framework with App Router
- **React 19.0.0** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend & APIs
- **Next.js API Routes** - Server-side functionality
- **Google Cloud reCAPTCHA Enterprise** - Bot protection
- **SmartyStreets JavaScript SDK** - Address validation
- **Google Maps API** - Location services

### Data Processing
- **ExcelJS** - Excel file manipulation
- **PapaParse** - CSV parsing
- **Cheerio** - HTML parsing and web scraping
- **XLSX** - Spreadsheet processing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Turbopack** - Fast bundler for development

## 📋 Component Architecture

### Core Components

#### DynamicComponent
The heart of the form system that dynamically renders form fields based on configuration:

```javascript
<DynamicComponent
  type="text"           // Component type
  id="fieldId"          // Unique identifier
  label="Field Label"   // Display label
  form={formState}      // Form state object
  handleChange={fn}     // Change handler
  required={true}       // Validation
  options={[]}          // For dropdowns
  // ... other props
/>
```

#### Specialized Input Components
- **AutoDropDownMenu**: Auto-complete dropdown with external data
- **DropDownMenu**: Static dropdown selection
- **EINNumber**: Formatted EIN input with validation
- **SocialSecurityNumber**: Formatted SSN input
- **Telephone**: Phone number input with formatting
- **ToggleButton**: Boolean toggle switches
- **HereGeoLocationComponent**: Location picker
- **PDFScrollViewer**: PDF document viewer

### Utility Components
- **DialogBox**: Modal dialogs
- **TextProcessor**: Text manipulation and validation
- **ReCaptchaScript**: reCAPTCHA integration
- **SignageDownloadPopup**: Document download interface

## 🔧 Configuration Files

### Package Configuration
- `package.json` - Dependencies and scripts
- `next.config.mjs` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS settings
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint rules

### Development Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🗃️ Data Management

### External Data Sources
- **Countries.json**: Country data for dropdowns
- **Disposable-domains.json**: Email domain blacklist
- **JobList.xlsx**: Employment data
- **National/Trust/Thrifts databases**: Financial institution data

### Data Processing Scripts
- `createEmailBlockingList.js` - Generate email blocklist
- `scrape-jobList.js` - Job data scraping
- `fetch-smart.js` - Smart data fetching utilities

## 🔐 Security Features

### Input Validation
- Content sanitization using custom functions
- Blocked terms filtering
- Maximum character limits
- Required field validation
- Format validation for SSN, EIN, phone numbers

### External Security
- Google reCAPTCHA Enterprise protection
- Secure API key management
- Address verification to prevent fraud

## 📱 User Experience

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive layouts for all dashboard types
- Touch-friendly interface elements

### Progressive Enhancement
- Server-side rendering with Next.js
- Client-side hydration for interactivity
- Graceful degradation for older browsers

### Accessibility
- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ginicoe-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with required API keys:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
   RECAPTCHA_SECRET_KEY=your_secret_key
   SMARTYSTREETS_AUTH_ID=your_auth_id
   SMARTYSTREETS_AUTH_TOKEN=your_auth_token
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📄 API Documentation

### Address Autocomplete
- **Endpoint**: `/api/smarty-autocomplete`
- **Method**: POST
- **Purpose**: Provides address suggestions and validation

### reCAPTCHA Verification
- **Endpoint**: `/api/verify-captcha`
- **Method**: POST
- **Purpose**: Validates reCAPTCHA tokens for form submissions

## 🎨 Styling Guidelines

### Tailwind CSS Classes
- Use utility classes for responsive design
- Maintain consistent spacing with Tailwind's scale
- Follow the established color palette
- Use semantic class names for complex components

### Component Styling
- Each component accepts `classes` and `outerClass` props
- Maintain consistent styling across similar components
- Use conditional classes for state-based styling

## 🧪 Testing Strategy

### Recommended Testing Approach
- Unit tests for utility functions
- Component testing for form elements
- Integration tests for API routes
- End-to-end tests for user flows

## 📚 Additional Resources

### Legal Documents
Located in `public/agreements/`:
- Merchant agreements and click-wrap documents
- Bank signage templates
- License and SLA documents

### Tutorial Materials
- Face scanning tutorial document
- PDF viewing examples
- Component usage examples

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with proper testing
3. Follow ESLint configuration
4. Submit pull request with description

### Code Style
- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Maintain consistent formatting

## 📞 Support

For technical support or questions about the Ginicoe application, please refer to the appropriate dashboard documentation or contact the development team.

---

*Last updated: August 4, 2025*
*Version: 0.1.0*
