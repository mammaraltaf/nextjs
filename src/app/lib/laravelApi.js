/**
 * Laravel API Service
 *
 * Centralized service for communicating with the Laravel backend API
 */

const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000';
const LARAVEL_API_BASE_PATH = process.env.LARAVEL_API_BASE_PATH || '/api/v1';
const LARAVEL_API_KEY = process.env.LARAVEL_API_KEY;

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - API endpoint path (e.g., '/submit-form')
 * @returns {string} Full URL
 */
export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${LARAVEL_API_URL}${LARAVEL_API_BASE_PATH}${cleanEndpoint}`;
}

/**
 * Get default headers for Laravel API requests
 * @param {boolean} includeContentType - Whether to include Content-Type header
 * @returns {Object} Headers object
 */
export function getApiHeaders(includeContentType = true) {
  const headers = {
    'Accept': 'application/json',
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  // Add API key if configured
  if (LARAVEL_API_KEY) {
    headers['Authorization'] = `Bearer ${LARAVEL_API_KEY}`;
  }

  return headers;
}

/**
 * Submit form data to Laravel API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Form data to submit
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
export async function submitToLaravel(endpoint, data, options = {}) {
  try {
    const url = getApiUrl(endpoint);
    const headers = options.isMultipart
      ? { 'Accept': 'application/json', ...(LARAVEL_API_KEY ? { 'Authorization': `Bearer ${LARAVEL_API_KEY}` } : {}) }
      : getApiHeaders();

    const requestOptions = {
      method: 'POST',
      headers,
      body: options.isMultipart ? data : JSON.stringify(data),
    };

    console.log('🚀 Sending request to Laravel:', {
      url,
      method: 'POST',
      hasApiKey: !!LARAVEL_API_KEY,
      isMultipart: !!options.isMultipart
    });

    const response = await fetch(url, requestOptions);

    // Try to parse response as JSON
    let responseData;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      console.warn('Non-JSON response received:', text);
      responseData = { message: text };
    }

    if (!response.ok) {
      console.error('❌ Laravel API error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData
      });

      // Create detailed error message
      let errorMessage = responseData.message || responseData.error || `API request failed with status ${response.status}`;

      // Include validation errors if present
      if (responseData.errors) {
        console.error('Validation errors:', responseData.errors);
        errorMessage = {
          message: errorMessage,
          validationErrors: responseData.errors,
          status: response.status
        };
      }

      const error = new Error(typeof errorMessage === 'string' ? errorMessage : errorMessage.message);
      error.validationErrors = typeof errorMessage === 'object' ? errorMessage.validationErrors : null;
      error.status = response.status;
      error.responseData = responseData;

      throw error;
    }

    console.log('✅ Laravel API success:', responseData);
    return responseData;

  } catch (error) {
    console.error('❌ Error communicating with Laravel API:', {
      endpoint,
      error: error.message,
      stack: error.stack
    });

    // Re-throw with more context
    if (error.message.includes('fetch')) {
      throw new Error(`Unable to connect to Laravel API at ${LARAVEL_API_URL}. Please ensure the Laravel server is running.`);
    }

    throw error;
  }
}

/**
 * Test Laravel API connection
 * @returns {Promise<Object>} Connection test result
 */
export async function testLaravelConnection() {
  try {
    const url = `${LARAVEL_API_URL}${LARAVEL_API_BASE_PATH}/health`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getApiHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'Laravel API is reachable',
        data
      };
    } else {
      return {
        success: false,
        message: `Laravel API returned status ${response.status}`,
        status: response.status
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Unable to connect to Laravel API',
      error: error.message
    };
  }
}

/**
 * Submit education form to Laravel
 * @param {Object} formData - Education form data
 * @returns {Promise<Object>} API response
 */
export async function submitEducationForm(formData) {
  return submitToLaravel('/education-submissions', formData);
}

/**
 * Submit government form to Laravel
 * @param {Object} formData - Government form data
 * @returns {Promise<Object>} API response
 */
export async function submitGovernmentForm(formData) {
  return submitToLaravel('/government-submissions', formData);
}

/**
 * Submit health form to Laravel
 * @param {Object} formData - Health form data
 * @returns {Promise<Object>} API response
 */
export async function submitHealthForm(formData) {
  return submitToLaravel('/health-submissions', formData);
}

/**
 * Submit merchant form to Laravel
 * @param {Object} formData - Merchant form data
 * @returns {Promise<Object>} API response
 */
export async function submitMerchantForm(formData) {
  return submitToLaravel('/merchant-submissions', formData);
}

/**
 * Submit financial institution form to Laravel
 * @param {Object} formData - Financial institution form data
 * @returns {Promise<Object>} API response
 */
export async function submitFinancialInstitutionForm(formData) {
  return submitToLaravel('/financial-institution-submissions', formData);
}

/**
 * Submit consumer form to Laravel
 * @param {FormData} formData - Consumer form data (multipart)
 * @returns {Promise<Object>} API response
 */
export async function submitConsumerForm(formData) {
  return submitToLaravel('/consumer-submissions', formData, { isMultipart: true });
}
