import { ScraperClient } from "./clients/scraper.client"

const url =
  "https://www.enr.com/articles/56337-southwest-design-firms-report-robust-revenue-gains-in-2022"

const scraper = new ScraperClient()

const selector = ".main-body p"
scraper
  .getText(url, selector)
  .then((e) => console.log((e)))
  .catch((e) => console.log(e))
