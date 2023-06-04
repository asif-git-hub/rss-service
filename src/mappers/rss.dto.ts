import { FeedContentRecordType } from "../repository/feedcontent.repo"
import { RssItemType } from "../types/rss.types"
import { toDateString } from "../utils/datetime.utils"

export function mapRssToDatabaseItem(
  feed: string,
  region: string,
  item: RssItemType
): FeedContentRecordType {
  return {
    feed,
    region,
    articleDate: toDateString(item.pubDate),
    title: item.title,
    articleLink: item.link,
    contentFromFeed: item.content,
    savedAt: new Date().toISOString(),
  }
}
