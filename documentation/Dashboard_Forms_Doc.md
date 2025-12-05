# Dashboard Forms Documentation

This document provides comprehensive documentation for all forms in the Ginicoe dashboard application.

## 📋 Form Overview

The dashboard contains several specialized forms for different user types:

1. **Healthcare Form** - For healthcare providers and medical institutions
2. **Government Form** - For government agencies and public sector organizations
3. **Education Form** - For educational institutions and academic organizations
4. **Financial Institutions Form** - For banks and financial service providers
5. **Merchant Form** - For retail businesses and merchants
6. **Consumer Form** - For individual consumers

## 🔬 Common Features Across All Forms

### Form Management
- **React state management**
- **Real-time validation**
- **Error handling and display**
- **Progress tracking**

### Security Implementation
- **reCAPTCHA v3 simple integration**
- **Input sanitization**
- **Blocked terms filtering**
- **XSS prevention**

### API Integration
- **Address verification (SmartyStreets)**
- **Captcha verification endpoint**
- **Form submission handling**
- **Data validation services**

### Styling & UX
- **Tailwind CSS implementation**
- **Responsive design**
- **Loading states**
- **Error feedback**

### Document Management
- **PDF signage downloads**
- **Agreement popups**
- **Document viewing integration**
- **Multi-file download support**

## 🏥 Healthcare Form

### Purpose
Healthcare provider registration for medical institution services and patient verification needs.

### Key Features
- **Provider information collection**
- **Service description capabilities**
- **HIPAA compliance considerations**
- **Medical facility verification**

### Form Sections

#### Provider Information
**Data Collected**:
- Healthcare provider name
- Facility type and classification
- License and certification info
- Contact details

#### Service Description
**Data Collected**:
- Services offered description
- Specializations and capabilities
- Patient volume estimates
- Technology requirements

#### Help & Support
**Data Collected**:
- Specific assistance needs
- Integration requirements
- Technical support requests
- Implementation timeline

### Healthcare-Specific Features
- **Name validation (letters only)**
- **Phone number formatting**
- **Service description text area**
- **HIPAA-compliant data handling**

### Submission Process
- **10-second processing delay**
- **Success confirmation**
- **Agreement popup integration**
- **Simple reCAPTCHA verification**

---

## 🏛️ Government Form

### Purpose
Government agency registration for public sector services and citizen verification.

### Key Features
- **Agency information collection**
- **Jurisdiction details**
- **Public service categorization**
- **Security clearance considerations**

### Form Sections

#### Agency Information
**Data Collected**:
- Government agency name
- Agency type and classification
- Jurisdiction information
- Contact details

#### Service Requirements
**Data Collected**:
- Public services offered
- Citizen verification needs
- Technology requirements
- Security protocols

#### Administrative Contact
**Data Collected**:
- Primary administrator name
- Phone number (formatted)
- Email address
- Communication preferences

### Government-Specific Features
- **Agency type classification**
- **Jurisdiction validation**
- **Public service categorization**
- **Government compliance standards**

### Submission Process
- **10-second processing delay**
- **Success confirmation**
- **Agreement popup integration**
- **Simple reCAPTCHA verification**

---

## 🎓 Education Form

### Purpose
Educational institution registration for academic verification and student services.

### Key Features
- **Institution information collection**
- **Academic service categorization**
- **Student privacy compliance**
- **Educational verification standards**

### Form Sections

#### Institution Information
**Data Collected**:
- Educational institution name
- Institution type and level
- Accreditation status
- Contact information

#### Service Requirements
**Data Collected**:
- Educational services needed
- Student verification requirements
- Technology integration needs
- Support requirements

#### Administrative Contact
**Data Collected**:
- Primary administrator name
- Phone number (formatted)
- Email address
- Communication preferences

### Education-Specific Features
- **Institution type classification**
- **Academic service categorization**
- **Student privacy compliance**
- **Educational verification standards**

### Submission Process
- **Similar to healthcare workflow**
- **Success confirmation page**
- **Agreement acceptance**
- **Simple reCAPTCHA verification**

---

## 💰 Financial Institutions Form

### Purpose
Bank and financial institution registration for financial services and compliance.

### Key Features
- **Institution information collection**
- **Financial service categorization**
- **Regulatory compliance**
- **Security standards**

### Form Sections

#### Institution Information
**Data Collected**:
- Financial institution name
- Institution type and charter
- Regulatory status
- Contact information

#### Service Requirements
**Data Collected**:
- Financial services offered
- Customer verification needs
- Technology requirements
- Compliance protocols

#### Administrative Contact
**Data Collected**:
- Primary administrator name
- Phone number (formatted)
- Email address
- Communication preferences

### Financial-Specific Features
- **Institution type classification**
- **Financial service categorization**
- **Regulatory compliance standards**
- **Security protocol implementation**

### Submission Process
- **Similar to other forms**
- **Success confirmation page**
- **Agreement acceptance**
- **Simple reCAPTCHA verification**

---

## 🛍️ Merchant Form

### Purpose
Retail business registration for merchant services and payment processing.

### Key Features
- **Business information collection**
- **Merchant service categorization**
- **Payment processing needs**
- **Security requirements**

### Form Sections

#### Business Information
**Data Collected**:
- Business name
- Business type and category
- Registration status
- Contact information

#### Service Requirements
**Data Collected**:
- Merchant services needed
- Payment processing requirements
- Technology integration needs
- Security protocols

#### Administrative Contact
**Data Collected**:
- Primary administrator name
- Phone number (formatted)
- Email address
- Communication preferences

### Merchant-Specific Features
- **Business type classification**
- **Merchant service categorization**
- **Payment processing standards**
- **Security protocol implementation**

### Submission Process
- **Similar to other forms**
- **Success confirmation page**
- **Agreement acceptance**
- **Simple reCAPTCHA verification**

---

## 👤 Consumer Form

### Purpose
Individual consumer registration for personal services and identity verification.

### Key Features
- **Personal information collection**
- **Identity verification**
- **Privacy protection**
- **Consumer rights compliance**

### Form Sections

#### Personal Information
**Data Collected**:
- Full name
- Date of birth
- Contact information
- Address details

#### Identity Verification
**Data Collected**:
- Government ID information
- Social security number
- Biometric data preferences
- Verification preferences

#### Service Requirements
**Data Collected**:
- Services needed
- Privacy preferences
- Communication preferences
- Support requirements

### Consumer-Specific Features
- **Identity verification processes**
- **Privacy protection measures**
- **Consumer rights compliance**
- **Personal data handling standards**

### Submission Process
- **Multi-step workflow**
- **Success confirmation page**
- **Agreement acceptance**
- **Simple reCAPTCHA verification**

---

## 🔧 Technical Implementation Details

### reCAPTCHA Integration

All forms now use the simplified reCAPTCHA v3 implementation:

1. **Frontend**:
   - ReCaptchaScript component loads the reCAPTCHA script
   - useRecaptcha hook provides clean interface for execution
   - Forms execute reCAPTCHA during submission process

2. **Backend**:
   - `/api/verify-captcha` endpoint handles token verification
   - Uses traditional reCAPTCHA v3 verification with secret key
   - Returns success status and risk score (0.0-1.0)

3. **Security**:
   - Minimum score threshold of 0.5 for all forms
   - Server-side verification only
   - Proper error handling and user feedback

### Environment Variables

Required environment variables:

```bash
# reCAPTCHA Configuration
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ginicoe
DB_USER=postgres
DB_PASSWORD=your_password

# Address Verification (SmartyStreets)
SMARTYSTREETS_AUTH_ID=your_auth_id
SMARTYSTREETS_AUTH_TOKEN=your_auth_token

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
```

### Form Validation

Each form implements comprehensive validation:

1. **Real-time validation** as users type
2. **Comprehensive validation** on form submission
3. **Custom validation rules** for each field type
4. **Error display** with clear user feedback

### Data Sanitization

All form data is sanitized before submission:

1. **Input sanitization** to prevent SQL injection
2. **Blocked terms filtering** to prevent inappropriate content
3. **Special character handling** for specific fields
4. **Data type validation** to ensure correct formats

### API Integration

Forms integrate with several backend services:

1. **Address verification** using SmartyStreets API
2. **reCAPTCHA verification** using Google reCAPTCHA v3
3. **Form submission** to PostgreSQL database
4. **Document generation** for PDF downloads

### Styling Guidelines

All forms follow consistent styling guidelines:

1. **Tailwind CSS** for responsive design
2. **Consistent color palette** across all forms
3. **Uniform spacing** using Tailwind's scale
4. **Accessible design** following WCAG standards

### Error Handling

Comprehensive error handling is implemented:

1. **Network error handling** for API calls
2. **Validation error display** with clear messages
3. **User feedback** through toast notifications
4. **Graceful degradation** when services are unavailable

### Testing

Each form can be tested through:

1. **Manual testing** by filling out and submitting forms
2. **Automated testing** using Jest and React Testing Library
3. **End-to-end testing** using Cypress
4. **Accessibility testing** using axe-core

### Deployment

Forms are deployed as part of the Next.js application:

1. **Static generation** for optimal performance
2. **Server-side rendering** for initial page load
3. **Client-side hydration** for interactive components
4. **API routes** for backend functionality