// Description: This file handles the API route for ZIP+4 code lookup
// Currently returns the standard 5-digit ZIP from Smarty autocomplete
//
// TO GET ZIP+4 CODES, you need to register for one of these APIs:
//
// Option 1: Smarty US Street API (Paid)
// - Register at: https://www.smarty.com/
// - Add credentials to .env.local:
//   SMARTY_STREET_AUTH_ID=your_auth_id
//   SMARTY_STREET_AUTH_TOKEN=your_auth_token
//
// Option 2: USPS Address API (Free for USPS shipping)
// - Register at: https://developers.usps.com/
// - Add credentials to .env.local:
//   USPS_CLIENT_ID=your_client_id
//   USPS_CLIENT_SECRET=your_client_secret
//
// Option 3: HERE Geocoding API (if client provides key)
// - Get key from client or register at: https://developer.here.com/
// - Add to .env.local:
//   NEXT_PUBLIC_HERE_GEO_CODE_API_KEY=your_api_key
//
// For now, this endpoint returns success with the 5-digit ZIP from Smarty autocomplete

export async function GET(req) {
  // Extract search parameters from the request URL
  const { searchParams } = new URL(req.url);
  const street = searchParams.get("street");
  const city = searchParams.get("city");
  const state = searchParams.get("state");
  const zipcode = searchParams.get("zipcode");

  console.log('ZIP Verification Request:', { street, city, state, zipcode });

  try {
    // Check for Smarty US Street API credentials
    const smartyStreetAuthId = process.env.SMARTY_STREET_AUTH_ID;
    const smartyStreetAuthToken = process.env.SMARTY_STREET_AUTH_TOKEN;

    if (smartyStreetAuthId && smartyStreetAuthToken) {
      // Use Smarty US Street API for ZIP+4
      const smartyUrl = `https://us-street.api.smarty.com/street-address?auth-id=${smartyStreetAuthId}&auth-token=${smartyStreetAuthToken}&street=${encodeURIComponent(street)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}${zipcode ? `&zipcode=${encodeURIComponent(zipcode)}` : ''}&match=invalid`;

      const res = await fetch(smartyUrl);
      const data = await res.json();

      if (data && data.length > 0 && data[0].components) {
        const zipPlus4 = data[0].components.plus4_code
          ? `${data[0].components.zipcode}-${data[0].components.plus4_code}`
          : data[0].components.zipcode;

        return new Response(JSON.stringify({
          success: true,
          zipcode: data[0].components.zipcode,
          zip4: data[0].components.plus4_code,
          zipPlus4: zipPlus4,
          source: 'smarty-street-api'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Check for HERE API credentials
    const hereApiKey = process.env.NEXT_PUBLIC_HERE_GEO_CODE_API_KEY;

    if (hereApiKey) {
      // Use HERE API for geocoding which may include ZIP+4
      const addressText = `${street}, ${city}, ${state} ${zipcode}`.trim();
      const hereUrl = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(addressText)}&apiKey=${hereApiKey}`;

      const res = await fetch(hereUrl);
      const data = await res.json();

      if (data && data.items && data.items.length > 0) {
        const postalCode = data.items[0].address.postalCode || zipcode;
        return new Response(JSON.stringify({
          success: true,
          zipPlus4: postalCode,
          source: 'here-api'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Fallback: return the provided ZIP code (from Smarty autocomplete)
    console.log('No ZIP+4 API configured - returning 5-digit ZIP from autocomplete');
    return new Response(JSON.stringify({
      success: true,
      zipcode: zipcode,
      zipPlus4: zipcode,
      source: 'smarty-autocomplete',
      note: 'ZIP+4 not available - configure Smarty Street API, HERE API, or USPS API to get ZIP+4'
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error verifying address:', error);
    // On error, still return success with basic ZIP
    return new Response(JSON.stringify({
      success: true,
      zipcode: zipcode,
      zipPlus4: zipcode,
      source: 'fallback',
      error: error.message
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// *****************************************************************
// Response from the Smarty US Street Address API
// *****************************************************************
// Example Response:
// [
//   {
//     "input_id": "01",
//     "input_index": 0,
//     "candidate_index": 0,
//     "addressee": "Apple Inc",
//     "delivery_line_1": "1 Infinite Loop",
//     "last_line": "Cupertino CA 95014-2083",
//     "delivery_point_barcode": "950142083017",
//     "components": {
//       "primary_number": "1",
//       "street_name": "Infinite",
//       "street_suffix": "Loop",
//       "city_name": "Cupertino",
//       "state_abbreviation": "CA",
//       "zipcode": "95014",
//       "plus4_code": "2083",
//       "delivery_point": "01",
//       "delivery_point_check_digit": "7"
//     },
//     "metadata": {
//       "record_type": "S",
//       "zip_type": "Standard",
//       "county_fips": "06085",
//       "county_name": "Santa Clara",
//       "carrier_route": "C067",
//       "congressional_district": "18",
//       "rdi": "Commercial",
//       "elot_sequence": "0031",
//       "elot_sort": "A",
//       "latitude": 37.33118,
//       "longitude": -122.03062,
//       "precision": "Zip9",
//       "time_zone": "Pacific",
//       "utc_offset": -8,
//       "dst": true
//     },
//     "analysis": {
//       "dpv_match_code": "Y",
//       "dpv_footnotes": "AABB",
//       "dpv_cmra": "N",
//       "dpv_vacant": "N",
//       "active": "Y"
//     }
//   }
// ]
