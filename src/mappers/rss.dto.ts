import { FeedContentRecordType } from "../repository/feedcontent.repo"
import { RssItemType } from "../types/rss.types"
import { toDateTimeString } from "../utils/datetime.utils"
import { removeSpacings } from "../utils/common.utils"

export function mapRssToFeedContentItem(
  feed: string,
  region: string,
  item: RssItemType,
  contentFromScraping?: string
): FeedContentRecordType {
  return {
    feed,
    region,
    articleDate: toDateTimeString(item.pubDate),
    title: item.title,
    articleLink: item.link,
    contentFromFeed: item.content,
    contentFromScraping: removeSpacings(contentFromScraping),
    savedAt: new Date().toISOString(),
  }
}
