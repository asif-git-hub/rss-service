import { RegionSummaryService } from "./region.summary.service"
import { SpecialSummaryService } from "./special.summary.service"
import { mysqlPool } from "../db/mysql/config/config"

export class SummaryOrchestratorService {
  private regionSummaryService: RegionSummaryService
  private specialSummaryService: SpecialSummaryService

  constructor() {
    this.regionSummaryService = new RegionSummaryService()
    this.specialSummaryService = new SpecialSummaryService()
  }

  async orchestrateSummaryCreation() {

    try {
      console.log("REGIONSUMMARY :: Creating region summary per article date")
      await this.regionSummaryService.createOneSummaryPerArticleDateAndRegion()
  
      console.log(
        "SPECIALSUMMARY :: Creating special summary per role and region"
      )
      await this.specialSummaryService.createAllSummaries()

    } catch (e) {

    } finally {
      console.log("Closing mysql connection")
      await mysqlPool.end()
    }



  }
}
