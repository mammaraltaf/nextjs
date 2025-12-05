const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const BASE_URL = 'https://www1.salary.com/Banking-Salaries.html?pageno=';
const TOTAL_PAGES = 78;

// This script scrapes job titles and their links from the Salary.com Banking Salaries page.
// It uses axios for HTTP requests and cheerio for parsing HTML.
// The results are saved in a text file with each job title on a new line.
// It iterates through all pages, scraping job titles and their corresponding links.
async function scrapeSalaryPage(page = 1) {
  try {
    const url = `${BASE_URL}${page}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const results = [];

    const section = $('.sa-layout-section.padding-top0.border-none.margin-left15');

    section.find('a.font-semibold').each((_, el) => {
      const jobTitle = $(el).text().trim();
      const link = $(el).attr('href');
      if (jobTitle !== 'View job details') {
        results.push({ jobTitle, link: `https://www1.salary.com${link}` });
      }
    });

    return results;
  } catch (err) {
    console.error(`❌ Page ${page} failed:`, err.message);
    return [];
  }
}
// This function orchestrates the scraping of all pages.
// It collects results from each page and saves them to a text file.
async function scrapeAllPages() {
  const allResults = [];

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`🔄 Scraping Page ${page}`);
    const pageResults = await scrapeSalaryPage(page);
    allResults.push(...pageResults);
  }

  console.log(`✅ Finished scraping ${allResults.length} job titles`);
  console.table(allResults.slice(0, 10)); // Show first 10
  console.log(allResults)
  fs.writeFileSync('jobs.txt', allResults.map(job => `"${job.jobTitle}"`).join(',\n'), 'utf8');
}

scrapeAllPages();
