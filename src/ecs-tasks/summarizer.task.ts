import { ArticleSummaryService } from "../services/article.summary.service"

const service = new ArticleSummaryService()

service
  .createOneSummary()
  .then(() => console.log("done"))
  .catch((e) => {
    console.error(e)
  })
