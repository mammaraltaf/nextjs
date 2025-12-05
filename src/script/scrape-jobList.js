const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');

const url = 'https://www.bls.gov/ooh/a-z-index.htm';

// This script scrapes job titles from the BLS A-Z index page and saves them to an Excel file.
// It uses axios for HTTP requests, cheerio for parsing HTML, and xlsx for creating Excel files.
// The job titles are extracted from the list items in the A-Z index and saved in a structured format.
async function scrapeJobTitles() {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const $ = cheerio.load(data);
    const jobList = [];

    $('.a-z-list-box ul li').each((i, el) => {
      const jobTitle = $(el).find('a').first().text().trim();
      if (jobTitle) {
        jobList.push({ JobTitle: jobTitle });
      }
    });

    // Create a worksheet
    const worksheet = xlsx.utils.json_to_sheet(jobList);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Jobs");

    // Write to Excel file
    xlsx.writeFile(workbook, 'JobList.xlsx');
    console.log("✅ Job list saved to JobList.xlsx");

  } catch (error) {
    console.error('❌ Error scraping:', error.message);
  }
}

scrapeJobTitles();
