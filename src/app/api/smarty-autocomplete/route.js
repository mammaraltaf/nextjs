// Description: This file handles the API route for Smarty Autocomplete, fetching address suggestions based on user input.
// It uses environment variables for authentication and constructs the request URL accordingly.

export async function GET(req) {
  // Extract search parameters from the request URL
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const selected = searchParams.get("selected");
  // fetch the Smarty authentication credentials from environment variables 
  const authId = process.env.SMARTY_AUTH_ID;
  const authToken = process.env.SMARTY_AUTH_TOKEN;
  // encode the search and selected parameters to ensure they are URL-safe
  const encode = str => str.replace(/ /g, '+').replace(/#/g, '%23');

  const smartyUrl = `https://us-autocomplete-pro.api.smarty.com/lookup?auth-id=${authId}&auth-token=${authToken}&search=${encode(search)}${selected ? `&selected=${encode(selected)}` : ''}`;
  console.log(smartyUrl);
  const res = await fetch(smartyUrl);
  // Response From the Smarty API is expected to be in JSON format
  // Searching Without selected will return a list of suggestions
  // Documentation: https://www.smarty.com/docs/cloud/us-autocomplete-pro-api
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// *****************************************************************
// Response from the Smarty Autocomplete API will be in JSON format
// *****************************************************************
// Smarty Autocomplete API Example Output without selected parameter
// {
// 	"suggestions": [
// 		{
// 			"street_line": "123 E 103rd St",
// 			"secondary": "",
// 			"city": "Chicago",
// 			"state": "IL",
// 			"zipcode": "60628",
// 			"entries": 0
// 		},
// 		{
// 			"street_line": "123 E 104th Pl",
// 			"secondary": "",
// 			"city": "Chicago",
// 			"state": "IL",
// 			"zipcode": "60628",
// 			"entries": 0
// 		}
// 	]
// }

// Smarty Autocomplete API Example Output with selected parameter
// param Example: ...lookup?search=1042+W+Center&selected=1042+W+Center+St+Apt+(108)+Orem+UT+84057
// {
//   "suggestions": [
//     {
//       "street_line": "1042 W Center St",
//       "secondary": "Apt A101",
//       "city": "Orem",
//       "state": "UT",
//       "zipcode": "84057",
//       "entries": 1
//     },
//     {
//       "street_line": "1042 W Center St",
//       "secondary": "Apt B101",
//       "city": "Orem",
//       "state": "UT",
//       "zipcode": "84057",
//       "entries": 1
//     },
//     {
//       "street_line": "1042 W Center St",
//       "secondary": "Apt C101",
//       "city": "Orem",
//       "state": "UT",
//       "zipcode": "84057",
//       "entries": 1
//     },
//   ]
// }