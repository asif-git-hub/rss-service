import { RssClient } from "./clients/rss.client"
const parser = new RssClient()

parser.getFeed("http://rss.cnn.com/rss/cnn_topstories.rss").then((r) => {
  console.log(r)
})
