import { FeedRetrievalService } from "../services/feed.retrieval.service"

const service = new FeedRetrievalService()

export const handler = async (
  _event: unknown,
  _context: unknown
): Promise<void> => {
  console.log("Initiating retrieval")

  await service.retrieveContent()
}
