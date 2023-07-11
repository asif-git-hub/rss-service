import { FeedContentRecordType } from "../repository/feedcontent.repo"
import { FeedRegionSummaryRecordType } from "../repository/region.summary.repo"
import { RssItemType } from "../types/rss.types"
import { toDateTimeString } from "../utils/datetime.utils"

export function mapRssToFeedContentItem(
  feed: string,
  regionCode: string,
  item: RssItemType,
  contentFromScraping?: string
): FeedContentRecordType {
  return {
    feed,
    regionCode,
    articleDate: toDateTimeString(item.pubDate),
    title: item.title,
    articleLink: item.link,
    contentFromFeed: item.content,
    contentFromScraping: contentFromScraping,
    savedAt: new Date().toISOString(),
  }
}
