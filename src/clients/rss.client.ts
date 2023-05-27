import Parser, { Item, Output } from "rss-parser"

export class RssClient {
  private parser: Parser

  constructor() {
    this.parser = new Parser()
  }

  async getFeed(url: string): Promise<Output<any>> {
    return await this.parser.parseURL(url)
  }
}
