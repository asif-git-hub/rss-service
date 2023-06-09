import { load } from "cheerio"
import { HttpClient } from "./http.client"

export class ScraperClient {
  private httpClient: HttpClient

  constructor() {
    this.httpClient = new HttpClient()
  }

  async getText(url: string, selector: string) {
    const response = await this.httpClient.get(url)

    const $ = load(response.data)
    return $(selector).text()
  }
}
