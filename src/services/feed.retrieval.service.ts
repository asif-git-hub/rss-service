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
    const feedRecords = await this.feedRepo.getAllFeeds()

    if (!feedRecords || feedRecords.length === 0) {
      console.log("No feeds retrieved, exiting", feedRecords)
      return
    }

    // Get RSS Feed Content
    for (const feedRecord of feedRecords) {
      const { feed, region, scrapeLinks, scrapingSelector } = feedRecord
      console.log(`Retrieving feed for ${feed}`)

      const feedResponse = await this.rssClient.getFeed(feed)

      console.log(
        `${feedResponse.items.length} feed items from ${feedResponse.title}`
      )

      // Save RSS Feed Content Items
      for (const item of feedResponse.items) {
        let contentFromScraping: undefined | string = undefined
        // Check if articles need to be scraped
        if (
          scrapeLinks &&
          scrapingSelector &&
          scrapeLinks === true &&
          String(item.link).endsWith("html")
        ) {
          console.log(`Content scraping required. Scraping: `, item.link)
          contentFromScraping = await this.scraperClient.getText(
            String(item.link),
            scrapingSelector
          )
        }
        const feedContentRecord = mapRssToFeedContentItem(
          feed,
          region,
          item,
          contentFromScraping
        )
        await this.feedContentRepo.insertSingleContent(feedContentRecord)
      }

      // Update Feed Table with fetch Date
      await this.feedRepo.updateFetchDate(feed, region)
      console.log(`Updated feed cotent for ${feed}`)
    }
  }
}
