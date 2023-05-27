import { RssClient } from "../clients/rss.client"
import { mapRssToDatabaseItem } from "../mappers/rss.dto"
import { FeedRepository } from "../repository/feed.repo"
import { FeedContentRepository } from "../repository/feedcontent.repo"

export class FeedRetrievalService {
  private rssClient: RssClient
  private feedRepo: FeedRepository
  private feedContentRepo: FeedContentRepository

  constructor() {
    this.rssClient = new RssClient()
    this.feedRepo = new FeedRepository()
    this.feedContentRepo = new FeedContentRepository()
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
      const { feed } = feedRecord
      console.log(`Retrieving feed for ${feed}`)

      const feedResponse = await this.rssClient.getFeed(feed)

      console.log(
        `${feedResponse.items.length} feed items from ${feedResponse.title}`
      )

      // Save RSS Feed Content Items
      for (const item of feedResponse.items) {
        const feedContentRecord = mapRssToDatabaseItem(feed, item)
        await this.feedContentRepo.insertSingleContent(feedContentRecord)
      }
      
      // Update Feed Table with fetch Date
      await this.feedRepo.updateFetchDate(feed)
      console.log(`Updated feed cotent for ${feed}`)
    }
  }
}
