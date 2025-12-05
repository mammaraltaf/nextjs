# PageComponents Documentation

## Overview

The `PageComponents` folder contains a collection of reusable React components that form the building blocks of the Ginicoe application's user interface. These components are designed for form handling, data input validation, document viewing, and user interaction across all dashboard types.

## 📁 Component Architecture

### Core Components

#### 🔄 DynamicComponent.js
**Purpose**: Universal form element renderer that dynamically displays different input types based on configuration

**Key Features:**
- Renders different component types based on `type` prop
- Supports conditional visibility based on form state
- Handles shared props for consistency across components
- Manages form validation and error handling

**Supported Types:**
- `text` - Standard text input fields
- `autoddm` - Auto-complete dropdown menu
- `dropdown` - Static dropdown selection
- `toggle` - Boolean toggle switches
- `ssn` - Social Security Number input with formatting
- `ein` - Employer Identification Number input
- `telephone` - Phone number with extension support
- `geolocation` - Address input with verification
- `textarea` - Multi-line text input
- `checklist` - Multiple checkbox selections
- `br` - Line break element
- `sectionHeading` - Section title display
- `label` - Standalone label element

**Props:**
```javascript
{
  type: string,           // Component type to render
  id: string,             // Unique identifier
  form: object,           // Form state object
  setform: function,      // Form state updater
  handleChange: function, // Change handler
  formErrors: object,     // Validation errors
  setFormErrors: function,// Error setter
  label: string,          // Primary label
  label2: string,         // Secondary label
  label3: string,         // Tertiary label
  options: array,         // Dropdown/checklist options
  required: boolean,      // Field requirement
  disabled: boolean,      // Disabled state
  classes: string,        // CSS classes
  // ... additional props
}
```

---

### 📋 Form Input Components

#### 🔍 AutoDropDownMenu.js
**Purpose**: Auto-complete dropdown with keyboard navigation and filtering

**Features:**
- Real-time filtering of options
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click-outside-to-close functionality
- Form integration with validation

**Key Methods:**
- `handleSelect()` - Processes option selection
- Keyboard event handling for navigation
- Auto-filtering based on input text

#### 📝 DropDownMenu.js
**Purpose**: Static dropdown menu with extensive customization options

**Features:**
- Keyboard navigation support
- Upward/downward opening direction
- Text slicing for long options
- Highlighted selection tracking
- Form validation integration

**Props:**
```javascript
{
  options: array,        // List of options
  openUpWards: boolean,  // Direction to open
  sliceText: boolean,    // Truncate long text
  // ... standard form props
}
```

#### 🏢 EINNumber.js
**Purpose**: Formatted input for Employer Identification Numbers

**Features:**
- Auto-formatting to XX-XXXXXXX pattern
- Real-time validation
- Maximum 9 digits enforcement
- Form integration with error handling

**Validation:**
- Accepts only numeric input
- Formats as user types
- Validates against EIN patterns

#### 🆔 SocialSecurityNumber.js
**Purpose**: Formatted input for Social Security Numbers

**Features:**
- Auto-formatting to XXX-XX-XXXX pattern
- Real-time input validation
- Maximum 9 digits with formatting
- Secure input handling

**Security Features:**
- Input sanitization
- Format enforcement
- Validation on change

#### 🔄 ToggleButton.js
**Purpose**: Custom toggle switch for boolean inputs

**Features:**
- Smooth animation transitions
- Mutual exclusion support (toggleIDs)
- Custom styling support
- Secondary label support

**Behavior:**
- Can disable other toggles when activated
- Visual feedback with color changes
- Accessible design with proper labeling

#### 📞 Telephone.js
**Purpose**: Phone number input with extension support

**Features:**
- 10-digit phone number validation
- Optional extension (1-4 digits)
- Real-time validation feedback
- Numeric input enforcement

**Validation Rules:**
- Phone: Exactly 10 digits
- Extension: 1-4 digits (optional)
- Error messages for invalid input

#### 📝 TextAreaField.js
**Purpose**: Multi-line text input with rich labeling

**Features:**
- Multiple label support (primary, secondary, help link)
- Required field indication
- Error message display
- Customizable styling
- Memoized for performance

---

### 🗺️ Location & Address Components

#### 📍 HereGeoLocationComponent.js
**Purpose**: Address input with auto-complete and verification

**Features:**
- Integration with SmartyStreets API
- Real-time address suggestions
- Address verification and validation
- Dropdown suggestion list
- Error handling for invalid addresses

**API Integration:**
- Fetches suggestions from `/api/smarty-autocomplete`
- Handles multiple address entries
- Builds complete address objects
- Validates address components and adds plus4code using here.com api

**Workflow:**
1. User types address (minimum 3 characters)
2. API call fetches suggestions
3. User selects from dropdown
4. Address is verified and validated
5. Form is updated with verified address

---

### 📄 Document & Media Components

#### 📄 PDFScrollViewer.js
**Purpose**: Embedded PDF viewer with scroll tracking

**Features:**
- PDF.js integration for viewing
- Scroll position tracking
- Agreement completion detection
- Message passing between iframe and parent

**Integration:**
- Uses `/pdfjs-dist/web/viewer.html` for rendering
- Tracks when user reaches bottom of document
- Enables agreement buttons when fully viewed
- Secure iframe implementation

#### 📥 SignageDownloadPopup.js
**Purpose**: Modal for document viewing and agreement acceptance

**Features:**
- PDF document preview
- Scroll-to-enable agreement button
- Fullscreen viewing option
- Modal overlay with close functionality
- Form integration for agreement tracking

**User Flow:**
1. Document opens in modal overlay
2. User must scroll to bottom of PDF
3. Agreement button becomes enabled
4. User can accept and form is updated

#### 🎥 FaceScanHud.js
**Purpose**: Face scanning interface with tutorial access

**Features:**
- Animated scanning interface
- Glowing pulse and rotation effects
- Tutorial access button
- Modern HUD-style design
- Step management integration

**Visual Elements:**
- Circular scanning ring with animations
- Pulse effects for active scanning
- Tutorial eye icon with hover effects
- Professional scanning interface

#### 📖 ShowLiveTutorial.js
**Purpose**: Step-by-step tutorial modal system

**Features:**
- Multi-step tutorial navigation
- Previous/Next step controls
- Text processing for rich content
- Modal overlay presentation
- Step completion tracking

**Content Processing:**
- Supports formatted text with TextProcessor
- Handles multiple steps with titles and descriptions
- Navigation between tutorial steps
- Integration with parent components

---

### 🛠️ Utility Components

#### 💬 DialogBox.js
**Purpose**: Confirmation dialog for destructive actions

**Features:**
- Modal confirmation overlay
- Cancel and confirm buttons
- Customizable message content
- Consistent styling across application

**Use Cases:**
- Delete confirmations
- Form submission warnings
- Data loss prevention

#### 🔐 ReCaptchaScript.jsx
**Purpose**: Google reCAPTCHA integration script loader

**Features:**
- Dynamic script loading
- Environment variable integration
- After-interactive loading strategy
- Security-focused implementation

**Configuration:**
- Uses `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- Loads after page becomes interactive
- Prevents render blocking

#### 📝 TextProcessor.js
**Purpose**: Rich text formatting and processing

**Features:**
- List item formatting (- prefix)
- Bold text processing (**text**)
- Colon-separated label/value pairs
- Automatic spacing and formatting

**Formatting Rules:**
- Lines starting with `-` become list items
- Text with colons creates label/value pairs
- `**text**` becomes bold
- Automatic spacing and indentation

#### 🎨 WordProcess.js
**Purpose**: Individual word formatting and styling

**Features:**
- Bold text pattern matching
- Underscore to space conversion
- Inline text processing
- Pattern-based formatting

**Patterns:**
- `**word**` → Bold formatting
- `_` → Space character
- Maintains word spacing

---

## 🔧 Component Integration

### Form State Management
All form components follow consistent patterns:

```javascript
// Standard form props
{
  form: object,           // Current form state
  setform: function,      // State updater function
  formErrors: object,     // Validation errors
  setFormErrors: function,// Error state updater
  handleChange: function, // Generic change handler
}
```

### Validation Integration
Components integrate with the validation system:

```javascript
import { runValidation } from '../Resources/ValidationFunctions';

// Example validation call
const errors = runValidation(section, updatedForm, fieldId);
setFormErrors(errors);
```

### Styling Conventions
All components accept styling props:

```javascript
{
  classes: string,      // Component-specific styles
  labelClasses: string, // Label styling
  outerClass: string,   // Container styling
}
```

## 🎯 Usage Examples

### Basic Text Input
```javascript
<DynamicComponent
  type="text"
  id="firstName"
  label="First Name"
  form={formState}
  setform={setFormState}
  handleChange={handleInputChange}
  required={true}
  classes="border rounded p-2"
/>
```

### Dropdown Selection
```javascript
<DynamicComponent
  type="dropdown"
  id="country"
  label="Country"
  options={countryOptions}
  form={formState}
  setform={setFormState}
  required={true}
/>
```

### Address Input with Verification
```javascript
<DynamicComponent
  type="geolocation"
  id="address"
  label="Street Address"
  form={formState}
  setform={setFormState}
  setVerifiedAddress={setVerifiedAddress}
  section="address"
/>
```

### Toggle Switch
```javascript
<DynamicComponent
  type="toggle"
  id="acceptTerms"
  label="I accept the terms and conditions"
  form={formState}
  setform={setFormState}
  required={true}
/>
```

## 🔒 Security Considerations

### Input Sanitization
- All text inputs are processed for blocked terms
- Maximum character limits enforced
- XSS prevention through proper escaping

### Validation
- Client-side validation for user experience
- Server-side validation for security
- Pattern matching for specific formats (SSN, EIN, Phone)

### Data Handling
- Sensitive data (SSN, EIN) handled securely
- Form state management prevents data leaks
- Proper error handling without exposing sensitive information

## 📱 Responsive Design

### Mobile Compatibility
- Touch-friendly interface elements
- Responsive layouts with Tailwind CSS
- Keyboard-friendly navigation
- Accessible design patterns

### Cross-Browser Support
- Modern browser compatibility
- Graceful degradation
- Progressive enhancement

## 🧪 Testing Recommendations

### Unit Testing
- Test individual component rendering
- Validate form state management
- Check validation logic
- Test event handlers

### Integration Testing
- Form submission workflows
- Component interaction
- API integration (address verification)
- Modal and dialog behaviors

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- ARIA label verification
- Color contrast validation

## 🚀 Performance Optimizations

### Code Splitting
- Components are lazily imported where possible
- Memoization used for expensive operations
- Efficient re-rendering patterns

### Bundle Optimization
- Tree shaking for unused code
- Optimized imports
- Minimal external dependencies

## 📚 Dependencies

### External Libraries
- `@react-google-maps/api` - Google Maps integration
- `lucide-react` - Icon components
- `next/script` - Optimized script loading

### Internal Dependencies
- `../Resources/ValidationFunctions` - Form validation
- `../Resources/Variables` - Configuration constants
- `../Resources/functions` - Utility functions

---

*Last updated: August 4, 2025*
*Components Version: 1.0.0*
