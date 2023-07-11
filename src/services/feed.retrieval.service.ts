import { RssClient } from "../clients/rss.client"
import { mapRssToFeedContentItem } from "../mappers/rss.dto"
import { FeedRepository } from "../repository/feed.repo"
import { FeedContentRepository } from "../repository/feedcontent.repo"
import { ScraperClient } from "../clients/scraper.client"

export class FeedRetrievalService {
  private rssClient: RssClient
  private feedRepo: FeedRepository
  private feedContentRepo: FeedContentRepository
  private scraperClient: ScraperClient

  constructor() {
    this.rssClient = new RssClient()
    this.feedRepo = new FeedRepository()
    this.feedContentRepo = new FeedContentRepository()
    this.scraperClient = new ScraperClient()
  }

  async retrieveContent() {
    // Extract all feeds to be fetched
    console.log("READ Feed initiating..")
    const feedRecords = await this.feedRepo.getAllFeeds()

    console.log("READRES Feed of length ", feedRecords?.length)

    if (!feedRecords || feedRecords.length === 0) {
      console.log("No feeds retrieved, exiting", feedRecords)
      return
    }

    // Get RSS Feed Content
    for (const feedRecord of feedRecords) {
      const { feed, regionCode, scrapeLinks, scrapingSelector } = feedRecord
      console.log(`FETCH Feed ${feed}`)

      try {
        const feedResponse = await this.rssClient.getFeed(feed)

        console.log(
          `FETCHRES ${feedResponse.items.length} feed items from ${feedResponse.title}`
        )

        // Save RSS Feed Content Items
        for (const item of feedResponse.items) {
          let contentFromScraping: undefined | string = undefined
          // Check if articles need to be scraped
          if (scrapeLinks && scrapingSelector && scrapeLinks === true) {
            console.log(`Content scraping required. Scraping: `, item.link)
            contentFromScraping = await this.scraperClient.getText(
              item.link,
              scrapingSelector
            )
          }
          const feedContentRecord = mapRssToFeedContentItem(
            feed,
            regionCode,
            item,
            contentFromScraping
          )
          await this.feedContentRepo.insertSingleContent(feedContentRecord)
        }

        // Update Feed Table with fetch Date
        await this.feedRepo.updateFetchDate(feed, regionCode)
        console.log(`Updated feed cotent for ${feed}`)
      } catch (e) {
        console.error(`Unable to process ${feedRecord.feed}. Reason: `, e)
      }
    }
  }
}
