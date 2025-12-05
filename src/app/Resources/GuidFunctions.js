import fips_codes from '@/app/Resources/fips_codes.json'
// remove ' County' from county object in fips_codes names
const update_fipsCodes = (codes) => {
    const updatedCodes = {};
    for (const [key, value] of Object.entries(codes)) {
        updatedCodes[key.replace(' County', '').replace(' Municipio','')] = value;
    }
    return updatedCodes;
};
fips_codes.county = update_fipsCodes(fips_codes.county);
// vairable map for form
const formVariable = {
    Consumer: 'C',
    Merchant: 'M',
    'Financial Institution': 'FI',
    Government: 'G',
    'Enterprise': 'E',
    'Health Care': 'HC',
}

// function to generate 5-digit random number
function generateRandomFiveDigitNumber() {
    return Math.floor(10000 + Math.random() * 90000);
}

//  8-digit date of customer signup
function generateEightDigitDate() {
    const date = new Date();
    const year = date.getFullYear().toString(); // year
    const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
    const day = String(date.getDate()).padStart(2, '0'); // day of the month
    return `${month}${day}${year}`; // format as DDMMYY
}

export function generateGUID(formName,state,county,INCA,INCB, fullAddress='') {
    // Example: CStateFIP-CountyFIP-DateStamp-5digitRandomNumber-5digitRandomNumber-INCA-INCB
    // INCA: 0000-9999, increements after INCB passes 9999
    // INCB: 0000-9999, resets after 9999
    const formVariableCode = formVariable[formName];
    let stateFips = fips_codes.state[state?.toUpperCase()];
    let countyFips = fips_codes.county[county];
    if(!countyFips) {
        fullAddress.split(',').forEach((part) => {
            console.log('Part:', part);
            const trimmedPart = part.trim();
            if(fips_codes.county[trimmedPart]) {
                countyFips = fips_codes.county[trimmedPart];
            }
        });
    }
    const dateStamp = generateEightDigitDate();
    const randomNumber1 = generateRandomFiveDigitNumber();
    const randomNumber2 = generateRandomFiveDigitNumber();
    
    return `${formVariableCode}${stateFips?stateFips:'78'}-${countyFips?countyFips:78030}-${dateStamp}-${randomNumber1}-${randomNumber2}-${INCA}-${INCB}`;
}