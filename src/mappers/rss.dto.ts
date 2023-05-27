import { FeedContentRecordType } from "../repository/feedcontent.repo"
import { RssItemType } from "../types/rss.types"

export function mapRssToDatabaseItem(
  feed: string,
  item: RssItemType
): FeedContentRecordType {
  return {
    feed,
    articleDate: item.pubDate,
    title: item.title,
    articleLink: item.link,
    content: item.content,
    savedAt: new Date().toISOString(),
  }
}
