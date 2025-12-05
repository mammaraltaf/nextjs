# Resources Folder Documentation

## Overview

The `Resources` folder contains essential utility functions, validation logic, configuration data, and security mechanisms that power the Ginicoe application. These modules provide centralized functionality for data validation, input sanitization, helper functions, and application constants.

## 📁 Folder Structure

```
Resources/
├── Variables.js              # Application constants and configuration data
├── functions.js              # Utility helper functions
├── ValidationFunctions.js    # Form validation logic and rules
├── SanitizingFunctions.js   # Input sanitization and security functions
└── disposable-domains.json # Database of disposable email domains (4,521 entries)
```

---

## 📊 Variables.js

### Purpose
Central repository for application constants, form options, dropdown data, and configuration variables used across all dashboards.

### Key Data Structures

#### 🎯 Consumer Form Data

##### **Tutorial Steps** (`steps`)
Face recognition tutorial system with 6 comprehensive steps:

```javascript
const steps = [
  {
    title: "General Guidelines for All liveness checks",
    description: "Camera positioning, lighting considerations for different skin tones, background requirements"
  },
  {
    title: "1. Head Movement", 
    description: "Natural head movement instructions to prevent static photo spoofing"
  },
  {
    title: "2. Finger or Hand Movement",
    description: "Hand gesture instructions to prevent cutouts and overlays"
  },
  {
    title: "3. Mouth Movement", 
    description: "Lip movement detection for dynamic liveness confirmation"
  },
  {
    title: "Attempt Limit Policy",
    description: "2-5 attempts per session, 5-minute timeout after failures"
  },
  {
    finally: "Success guidelines and best practices"
  }
]
```

**Features**:
- Skin tone specific lighting guidance
- Anti-spoofing detection methods
- Attempt limiting and timeout policies
- Comprehensive user instruction system

##### **Progress Tracking** (`consumerProgressTackers`)
11-step consumer onboarding process:
1. My Pedigree Info
2. Notice and Consent for Biometric
3. Face Recognition
4. Address
5. Gender Identity Information
6. Ethnicity Information
7. My Neighbors Are
8. Employment Information
9. Protect Charge Cards
10. Review & Edit
11. How did you hear about Us?

##### **Personal Information Options**
- **Suffix Options**: 15 standard name suffixes (Mr., Mrs., Jr., Sr., II-IX)
- **Military Service**: 5 branch options (Army, Air Force, Marines, Navy, Space Force)
- **Referral Sources**: 9 marketing channels and referral methods

#### 🏪 Merchant Form Data

##### **Business Classification**
- **Business Types**: 9 entity types (C-Corp, LLC, S-Corp, Sole Proprietorship, etc.)
- **Industries**: 24 industry classifications following NAICS standards
- **Primary Line of Business**: 20 standardized business categories
- **Employee Count Ranges**: 6 size categories (1-50 to 10,000+)
- **Monthly Sales Ranges**: 6 revenue brackets ($0-$3,000 to $100,000+)

##### **Payment Processing**
- **POS Systems**: 50+ supported point-of-sale systems
  - Popular systems: Square, Clover, Toast, Shopify, etc.
  - Enterprise solutions: Aloha, Agilysys, Epicor
  - Industry-specific: Lavu (restaurants), Bottle POS (bars)

- **Payment Processors**: 25+ payment processing companies
- **Acquiring Banks**: 15+ major acquiring bank relationships

##### **Geographic Data**
- **Categories**: 50+ business category classifications
- **Location Types**: Physical, online, mobile business classifications

#### 🏦 Financial Institution Data

##### **Institution Types** (26 categories)
Comprehensive classification system:
- **Traditional Banking**: Commercial Banks, Credit Unions, Community Banks
- **Investment Services**: Investment Banks, Hedge Funds, Asset Management
- **Insurance**: Insurance Companies, various insurance types
- **Specialized**: Shadow Banks, Payday Lenders, Title Companies
- **Securities**: Stock/Bond Brokerage Firms, Full/Discount Brokers

##### **Financial Services Portfolio** (43 services)
Complete service categorization:
- **Banking Services**: Checking, Savings, Demand Deposits
- **Lending**: Auto Loans, Mortgages, Personal Loans, Commercial Loans
- **Investment Products**: Stocks, Bonds, ETFs, Mutual Funds (Open/Closed)
- **Insurance Products**: Auto, Life, Health, Disability, Property, Fire, Casualty
- **Specialized Services**: Wire Transfers, SWIFT, Trading, Wealth Advisory
- **Commercial Services**: M&A Facilitation, Corporate Reorganizations

##### **Portfolio Management**
- **Transaction Ranges**: Volume-based classification system
- **Financial Size Options**: Institution size categorization
- **Portfolio Tracking**: Service-specific portfolio size management

#### 🏛️ Government Data

##### **Federal Agencies**
Comprehensive list of government entities:
- **Executive Departments**: Agriculture, Commerce, Defense, Education, etc.
- **Independent Agencies**: EPA, FDA, FCC, FTC, etc.
- **Regulatory Bodies**: SEC, CFTC, FDIC, etc.
- **Intelligence**: CIA, NSA, FBI, etc.

##### **Government Sectors**
- **Federal**: Executive, Legislative, Judicial branches
- **State**: State-level agencies and departments
- **Local**: Municipal and county governments
- **Special Purpose**: Authorities, districts, commissions

##### **Authority Levels**
- **Budgeting Authority**: Various levels of financial decision-making
- **Procurement Authority**: Purchasing and contracting capabilities
- **Regulatory Authority**: Rule-making and enforcement powers

#### 🔒 Security Data

##### **Forbidden SQL Keywords** (`forbiddenSQLKeywords`)
Comprehensive SQL injection prevention list:
- **Query Operations**: SELECT, INSERT, UPDATE, DELETE
- **Data Manipulation**: WHERE, AND, OR, BETWEEN, LIKE
- **Schema Operations**: CREATE, ALTER, DROP, TRUNCATE
- **System Functions**: EXEC, EXECUTE, UNION, JOIN
- **Administrative**: GRANT, REVOKE, BACKUP, RESTORE

**Features**:
- Case-insensitive detection
- Variant pattern matching
- Context-aware filtering

### Data Integration Functions

#### **Job Data Processing**
- `getJobTitlesData()`: Processes job title Excel files
- `getFinancialInstitutionsData()`: Bank data processing
- Dynamic data loading from Excel sources

#### **External Data Sources**
- National bank listings
- Trust company databases
- Thrift institution data
- Job classification systems

---

## 🛠️ functions.js

### Purpose
Collection of utility functions for data processing, formatting, validation helpers, and common operations across the application.

### Core Functions

#### 📍 **Address Processing**

##### `buildAddress(suggestion)`
Constructs formatted address strings from autocomplete suggestions:

```javascript
// Input: suggestion object from SmartyStreets API
// Output: Formatted address string for API queries
const formatted = buildAddress({
  street_line: "123 Main St",
  secondary: "Apt 4B",
  city: "New York", 
  state: "NY",
  zipcode: "10001",
  entries: 2
});
// Result: "123+Main+St+Apt+4B+(2)+New+York+NY+10001"
```

**Features**:
- Handles secondary address information
- Manages multiple address entries
- URL encoding for API compatibility
- Special character escaping

#### 📱 **Phone Number Formatting**

##### `formatPhoneNumber(value)`
Progressive phone number formatting as user types:

```javascript
formatPhoneNumber("1234567890");  // Returns: "(123) 456 - 7890"
formatPhoneNumber("123");         // Returns: "(123"
formatPhoneNumber("1234");        // Returns: "(123) 4"
formatPhoneNumber("1234567");     // Returns: "(123) 456"
```

**Features**:
- Real-time formatting during input
- Handles partial input gracefully
- 10-digit limitation enforcement
- Progressive display enhancement

#### 💳 **Credit Card Processing**

##### `getCardType(number)`
Identifies credit card type based on number patterns:

```javascript
getCardType("4111111111111111");    // Returns: "Visa"
getCardType("5555555555554444");    // Returns: "Mastercard"  
getCardType("378282246310005");     // Returns: "Americanexpress"
getCardType("6011111111111117");    // Returns: "Discover"
getCardType("30569309025904");      // Returns: "Dinerclub"
```

**Supported Card Types**:
- **Visa**: Pattern `^4\d{12}(\d{3})?(\d{3})?$`
- **Mastercard**: Multiple patterns for legacy and new ranges
- **American Express**: Pattern `^3[47]\d{13}$`
- **Discover**: Pattern `^6(?:011|5\d{2}|4[4-9]\d)\d{12}$`
- **Diners Club**: Pattern `^3(?:0[0-5]|[68])\d{11}$`
- **PayPal**: Default fallback for unrecognized patterns

#### 📅 **Date Processing**

##### `olderThan2Years(dateString)`
Determines if a date is more than 2 years old:

```javascript
olderThan2Years("2021-01-01");  // Returns: true (if current year > 2023)
olderThan2Years("2023-12-01");  // Returns: false (if current year = 2025)
```

**Features**:
- Precise year, month, and day comparison
- Handles edge cases around anniversaries
- Used for address history validation

#### 🔍 **Error Handling**

##### `countErrors(fields, formErrors)`
Counts validation errors across form sections:

```javascript
const errors = {
  firstName: "Required field",
  cards: [
    { number: "Invalid format" },
    { expiry: "Expired card" }
  ]
};
countErrors(['firstName', 'cards'], errors);  // Returns: 3
```

**Features**:
- Handles nested error objects
- Supports array-based errors
- Single and multiple error counting

##### `scrollToError(errors)`
Automatically scrolls to first error field:

```javascript
scrollToError({
  email: "Invalid email format",
  phone: "Invalid phone number"
});
// Scrolls to element with ID "error-email"
```

**Features**:
- Smooth scrolling behavior
- Centers error in viewport
- DOM element targeting by error key

#### 📊 **Excel Data Processing**

##### `parseBankData()`
Processes financial institution data from Excel files:

```javascript
// Reads Excel worksheet and extracts:
// - Bank names and identifiers
// - Institution types and classifications  
// - Contact information
// - Regulatory data
```

##### `parseJobList()`
Processes employment data from job classification files:

```javascript
// Extracts job titles and categories
// Builds searchable job title database
// Formats for autocomplete functionality
```

**Features**:
- ExcelJS integration for file processing
- Data normalization and validation
- Structured output for dropdown population

---

## ✅ ValidationFunctions.js

### Purpose
Comprehensive form validation system with field-specific rules, cross-field dependencies, and section-based validation logic.

### Core Validation Engine

#### 🎯 **Main Validation Function**

##### `runValidation(section, formData, changedField = null)`
Central validation orchestrator:

```javascript
// Validates specific form section
const errors = runValidation('my_pedigree_info', formData, 'firstName');

// Validates entire form
const allErrors = runValidation('consumer_complete', formData);
```

**Parameters**:
- `section`: Form section identifier (e.g., 'my_pedigree_info', 'address')
- `formData`: Complete form state object
- `changedField`: Specific field to validate (optional, validates all if null)

**Return Value**: Error object with field-specific messages

### Validation Schemas

#### 👤 **Consumer Form Validation**

##### **Pedigree Information** (`my_pedigree_info`)
```javascript
{
  firstName: validateName('First name', 26, true, 'Use your first 26 characters only.'),
  middleInitial: validateName('Middle initial', 26, false),
  lastName: validateName('Last name', 26, true),
  nickName: validateName('Nickname', 26, false),
  suffix: (value) => !value ? 'Suffix is required' : true,
  dateOfBirth: (value) => {
    if (!value) return 'Date of Birth is required';
    const validation = validateDOB(value);
    return validation !== 'Valid' ? validation : true;
  },
  socialSecurityNumber: (value) => !isValidSSN(value) ? 'Invalid Social Security Number' : true,
  verifySocialSecurityNumber: (value) => {
    // Cross-field validation with socialSecurityNumber
    if (!value) return 'Verification required';
    if (formData.socialSecurityNumber !== value) return 'SSN does not match';
    return isValidSSN(value) ? true : 'Invalid SSN format';
  }
}
```

##### **Address Validation** (`address`)
```javascript
{
  current_us_address: (value) => {
    if (!value) return 'Current US Address is required';
    if (!formData.verified_current_us_address) {
      return 'Address must be verified';
    }
    return true;
  },
  moveInDate: (value) => {
    if (!value) return 'Move In Date is required';
    const moveInDate = new Date(value);
    const today = new Date();
    return moveInDate > today ? 'Date cannot be in the future' : true;
  },
  previous_us_address: (value) => {
    // Conditional validation based on move-in date
    if (olderThan2Years(formData.moveInDate)) return true;
    if (!value) return 'Previous US Address is required';
    return formData.verified_previous_us_address ? true : 'Address must be verified';
  }
}
```

##### **Card Information** (`card_info`)
Array-based validation for multiple payment cards:

```javascript
{
  // Validates each card in the array
  validateCardArray: (cardArray) => {
    return cardArray.map(card => ({
      card_number: validateCardNumber(card.card_number),
      expiry_date: validateExpiryDate(card.expiry_date),
      cvv: validateCVV(card.cvv),
      nick_name: validateCardNickname(card.nick_name)
    }));
  }
}
```

#### 🏪 **Business Form Validation**

##### **Merchant Form** (`merchant_form`)
```javascript
{
  businessLegalName: validateBusinessName(true),
  federalTaxId: validateEIN(),
  ownerPercentageOwnership: validateFloatPercent(),
  businessWebsite: validateURL(),
  primaryTelephone: validateOfficePhone(true),
  businessAddress: validateAddress(true)
}
```

##### **Financial Institution** (`financial_institution_form`)
```javascript
{
  institutionName: validateInstitutionName(),
  institutionTypes: validateInstitutionSelection(),
  portfolioSizes: validatePortfolioData(),
  primaryContact: validateContactInfo()
}
```

#### 🏛️ **Government Form** (`govt_form`)
```javascript
{
  agencyName: validateAgencyName(),
  federalAffiliation: validateFederalAgency(),
  budgetingAuthority: validateAuthorityLevel(),
  officeAddress: validateGovernmentAddress()
}
```

### Specialized Validation Functions

#### 📧 **Email Validation**

##### `isDisposableEmail(email)`
Prevents disposable email usage:
```javascript
isDisposableEmail("test@10minutemail.com");  // Returns: true
isDisposableEmail("user@gmail.com");         // Returns: false
```

#### 📞 **Phone Validation**

##### `isValidOfficePhoneNumber(input, required = true)`
Validates business phone format:
```javascript
isValidOfficePhoneNumber("(123) 456 - 7890");  // Returns: true
isValidOfficePhoneNumber("123-456-7890");       // Returns: error message
```

**Format Required**: `(XXX) XXX - XXXX`

#### 🆔 **SSN Validation**

##### `isValidSSN(input)`
Comprehensive Social Security Number validation:

```javascript
isValidSSN("123-45-6789");  // Returns: true
isValidSSN("000-12-3456");  // Returns: false (invalid area)
isValidSSN("123-00-4567");  // Returns: false (invalid group)
```

**Validation Rules**:
- Format: XXX-XX-XXXX or 9 digits
- Area number: Not 000, 666, or 900-999
- Group number: Not 00
- Serial number: Not 0000
- No all-same-digit patterns

#### 💳 **Credit Card Validation**

##### `isValidLuhn(number)`
Luhn algorithm implementation:
```javascript
isValidLuhn("4111111111111111");  // Returns: true (valid test card)
isValidLuhn("4111111111111112");  // Returns: false (fails checksum)
```

**Algorithm Steps**:
1. Reverse digit order
2. Double every second digit
3. Subtract 9 if doubled digit > 9
4. Sum all digits
5. Valid if sum % 10 === 0

#### 🌐 **URL Validation**

##### `isValidSiteUrl(url)`
Validates business website URLs:
```javascript
isValidSiteUrl("https://example.com");           // Returns: true
isValidSiteUrl("http://business.org/about");     // Returns: true  
isValidSiteUrl("business.gov");                  // Returns: true
isValidSiteUrl("temp-site.10minutemail.com");   // Returns: "Disposable URLs not allowed"
```

**Features**:
- Optional protocol (http/https)
- Domain and TLD validation
- Disposable domain checking
- Path and query parameter support

#### 📊 **Percentage Validation**

##### `isValidFloatPercent(value)`
Validates ownership percentages:
```javascript
isValidFloatPercent("25.50%");  // Returns: true
isValidFloatPercent("99");      // Returns: true
isValidFloatPercent("100.0");   // Returns: true
isValidFloatPercent("25.555");  // Returns: error (too many decimals)
```

**Format Rules**:
- 1-2 digit integers (1-99)
- Optional 2 decimal places (XX.XX)
- Optional percentage symbol (%)

### Cross-Field Validation

#### **Dependent Field Logic**
```javascript
// Address validation depends on move-in date
previous_us_address: (value) => {
  if (olderThan2Years(formData.moveInDate)) {
    return true; // Skip if lived there > 2 years
  }
  return validateRequiredAddress(value);
}

// Veteran fields depend on veteran status
branchOfService: (value) => {
  if (formData.areYouUSVeteran && !value) {
    return 'Branch required for veterans';
  }
  return true;
}
```

#### **Error Aggregation**
```javascript
// Collects all field errors for a section
const sectionErrors = runValidation('address', formData);
// Result: { current_us_address: "Required", moveInDate: "Invalid date" }

// Single field validation
const fieldError = runValidation('address', formData, 'moveInDate');
// Result: { moveInDate: "Invalid date" }
```

---

## 🛡️ SanitizingFunctions.js

### Purpose
Comprehensive input sanitization system to prevent security vulnerabilities including SQL injection, XSS attacks, and inappropriate content filtering.

### Core Security Functions

#### 🔒 **Blocked Terms Management**

##### `loadBlockedTerms()`
Loads prohibited terms from external CSV file:
```javascript
const blockedTerms = await loadBlockedTerms();
// Loads from '/Terms-to-Block.csv'
// Returns array of normalized, lowercase terms
```

**Processing Features**:
- CSV parsing with multiple delimiters
- Quote and backslash removal
- Duplicate elimination
- Normalization and trimming

##### `compileBlockedTerms(terms)`
Creates optimized regex pattern for term detection:
```javascript
const pattern = compileBlockedTerms(blockedTerms);
// Returns RegExp for fast pattern matching
// Includes word boundaries for accurate detection
```

**Pattern Features**:
- Word boundary matching (`\b`)
- Case-insensitive matching
- Special character escaping
- Combined with naughty-words library

#### 🚫 **Profanity Detection**

##### **Advanced Obfuscation Detection**
Handles character substitution attempts:
```javascript
const obfuscationMap = {
  a: ['@', '4'],      // @ or 4 for 'a'
  e: ['3'],           // 3 for 'e'  
  i: ['1', '!', '|'], // 1, !, | for 'i'
  o: ['0','*'],       // 0 or * for 'o'
  s: ['$', '5'],      // $ or 5 for 's'
  // ... more mappings
};
```

##### `generateObfuscatedVariants(word, maxDepth = 2)`
Creates character substitution variants:
```javascript
generateObfuscatedVariants("hello");
// Returns: ["hello", "h3llo", "he110", "h3110", ...]
```

**Features**:
- Multi-level character replacement
- Depth-limited generation (prevents explosion)
- Comprehensive variant coverage
- Integration with naughty-words library

#### 🧼 **Input Sanitization**

##### `SanitizeInput(input = '', compiledPattern)`
Main sanitization function:
```javascript
const clean = SanitizeInput("SELECT * FROM users", compiledPattern);
// Removes SQL keywords and blocked terms
```

**Sanitization Process**:
1. **Unicode Normalization**: NFKC normalization for consistent matching
2. **SQL Keyword Removal**: Eliminates forbidden SQL patterns
3. **Blocked Terms Filtering**: Removes prohibited words and phrases
4. **Special Character Handling**: Preserves spaces and formatting
5. **Exception Handling**: Allows legitimate URLs and content

**SQL Injection Prevention**:
- Removes dangerous SQL keywords
- Handles case variations
- Eliminates special SQL characters
- Prevents command injection

**XSS Protection**:
- Script tag detection
- Event handler removal  
- Dangerous attribute filtering
- URL scheme validation

### Security Integration

#### **Real-time Protection**
```javascript
// Form input handler with sanitization
const handleChange = (e) => {
  let { value } = e.target;
  value = SanitizeInput(value, compiledBlockedTerms);
  setFormState({...form, [field]: value});
};
```

#### **Content Filtering Levels**
1. **Basic**: SQL injection and XSS prevention
2. **Standard**: + blocked terms from CSV
3. **Comprehensive**: + profanity and obfuscation detection
4. **Maximum**: + context-aware filtering

#### **Performance Optimization**
- **Compiled Patterns**: Pre-compiled regex for speed
- **Lazy Loading**: Terms loaded on demand
- **Caching**: Pattern caching for repeated use
- **Minimal Processing**: Early exits for clean input

---

## 📋 disposable-domains.json

### Purpose
Comprehensive database of disposable email domains to prevent temporary email usage in form submissions.

### Database Characteristics

#### **Scale and Coverage**
- **Total Domains**: 4,521 disposable email domains
- **Regular Updates**: Maintained list of active services
- **Global Coverage**: International temporary email services
- **Service Types**: Various temporary email categories

#### **Domain Categories**

##### **Temporary Email Services**
```json
[
  "10minutemail.com",
  "temp-mail.org", 
  "guerrillamail.com",
  "mailinator.com",
  "disposablemail.com"
]
```

##### **Numbered/Generated Domains**
```json
[
  "027168.com",
  "062e.com", 
  "0845.ru",
  "105kg.ru"
]
```

##### **Regional Services**
```json
[
  "0815.ru",        // Russian
  "0rg.fr",         // French
  "10minut.com.pl", // Polish
  "10minutemail.de" // German
]
```

##### **Specialized Services**
```json
[
  "0clickemail.com",    // One-click email
  "1000rebates.stream", // Marketing-focused
  "100likers.com",      // Social media related
  "0box.eu"             // European service
]
```

### Integration Points

#### **Email Validation**
```javascript
import disposableDomains from './disposable-domains.json';

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}
```

#### **URL Validation**
```javascript
// Also used for website URL validation
function isValidSiteUrl(url) {
  const domain = extractDomain(url);
  if (disposableDomains.includes(domain)) {
    return 'Disposable URLs are not allowed';
  }
  return true;
}
```

#### **Real-time Checking**
- Form validation during input
- Pre-submission verification
- Account creation prevention
- Contact form protection

---

## 🔗 Integration Patterns

### Cross-Module Dependencies

#### **Validation ↔ Variables**
```javascript
// ValidationFunctions.js imports from Variables.js
import { forbiddenSQLKeywords } from './Variables.js';

// Variables.js imports processing functions
import { parseBankData, parseJobList } from './functions.js';
```

#### **Sanitization ↔ Variables**
```javascript
// SanitizingFunctions.js uses SQL keywords
import { forbiddenSQLKeywords } from './Variables.js';

// Combined with naughty-words for comprehensive filtering
import naughtyWords from 'naughty-words';
```

#### **Functions ↔ Validation**
```javascript
// ValidationFunctions.js uses utility functions
import { olderThan2Years } from './functions.js';

// functions.js supports validation workflows
export const scrollToError = (errors) => { /* ... */ };
```

### Dashboard Integration

#### **Form Components**
```javascript
// All dashboards import validation
import { runValidation } from '@/app/Resources/ValidationFunctions';

// Form change handlers use sanitization
import { SanitizeInput } from '@/app/Resources/SanitizingFunctions';

// Dropdown data from variables
import { businessTypes, industries } from '@/app/Resources/Variables';
```

#### **Real-time Processing**
```javascript
const handleChange = (e) => {
  let { id, value } = e.target;
  
  // 1. Sanitize input
  value = SanitizeInput(value, compiledBlockedTerms);
  
  // 2. Format if needed
  if (id === 'phone') value = formatPhoneNumber(value);
  
  // 3. Update form state
  setForm({...form, [id]: value});
  
  // 4. Validate
  const errors = runValidation(section, {...form, [id]: value}, id);
  setFormErrors({...formErrors, ...errors});
};
```

---

## 🚀 Performance Considerations

### Optimization Strategies

#### **Compiled Patterns**
- Pre-compile regex patterns for blocked terms
- Cache validation schemas
- Minimize repeated pattern creation

#### **Lazy Loading**
- Load disposable domains on first use
- Defer Excel processing until needed
- Progressive data loading

#### **Efficient Validation**
- Field-specific validation when possible
- Early exit for clean inputs
- Batch validation for form sections

#### **Memory Management**
- Shared validation schemas
- Reused utility functions
- Minimal data duplication

---

## 🔧 Usage Examples

### Basic Form Integration
```javascript
import { 
  runValidation, 
  SanitizeInput, 
  formatPhoneNumber,
  businessTypes 
} from '@/app/Resources';

const FormComponent = () => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    let { id, value } = e.target;
    
    // Sanitize
    value = SanitizeInput(value, compiledPattern);
    
    // Format
    if (id === 'phone') value = formatPhoneNumber(value);
    
    // Update
    const newForm = {...form, [id]: value};
    setForm(newForm);
    
    // Validate
    const fieldErrors = runValidation('section', newForm, id);
    setErrors({...errors, ...fieldErrors});
  };
  
  const handleSubmit = () => {
    const allErrors = runValidation('section', form);
    if (Object.keys(allErrors).length === 0) {
      // Submit form
    } else {
      setErrors(allErrors);
      scrollToError(allErrors);
    }
  };
};
```

### Advanced Security Integration
```javascript
import { 
  loadBlockedTerms, 
  compileBlockedTerms,
  SanitizeInput 
} from '@/app/Resources/SanitizingFunctions';

const SecurityProvider = ({ children }) => {
  const [compiledPattern, setCompiledPattern] = useState(null);
  
  useEffect(() => {
    const initSecurity = async () => {
      const terms = await loadBlockedTerms();
      const pattern = compileBlockedTerms(terms);
      setCompiledPattern(pattern);
    };
    initSecurity();
  }, []);
  
  return (
    <SecurityContext.Provider value={{ compiledPattern }}>
      {children}
    </SecurityContext.Provider>
  );
};
```

---

## 📚 Best Practices

### Security Guidelines
1. **Always sanitize** user input before processing
2. **Validate on both** client and server sides  
3. **Use compiled patterns** for performance
4. **Handle edge cases** in validation logic
5. **Test with malicious** input examples

### Performance Guidelines
1. **Cache validation** schemas where possible
2. **Validate incrementally** during user input
3. **Use lazy loading** for large datasets
4. **Optimize regex patterns** for speed
5. **Minimize DOM manipulation** in error handling

### Maintenance Guidelines
1. **Update disposable domains** regularly
2. **Review blocked terms** periodically
3. **Test validation rules** with real data
4. **Monitor security** effectiveness
5. **Document schema changes** clearly

---

*Last updated: August 4, 2025*  
*Documentation Version: 1.0.0*
