import { FeedContentRecordType } from "../repository/feedcontent.repo"
import { RssItemType } from "../types/rss.types"
import { toDateString } from "../utils/datetime.utils"

export function mapRssToDatabaseItem(
  feed: string,
  item: RssItemType
): FeedContentRecordType {
  return {
    feed,
    articleDate: toDateString(item.pubDate),
    title: item.title,
    articleLink: item.link,
    content: item.content,
    savedAt: new Date().toISOString(),
  }
}
