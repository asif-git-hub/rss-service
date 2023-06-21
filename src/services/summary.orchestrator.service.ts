import { RegionSummaryService } from "./region.summary.service"
import { SpecialSummaryService } from "./special.summary.service"
export class SummaryOrchestratorService {
  private regionSummaryService: RegionSummaryService
  private specialSummaryService: SpecialSummaryService

  constructor() {
    this.regionSummaryService = new RegionSummaryService()
    this.specialSummaryService = new SpecialSummaryService()
  }

  async orchestrateSummaryCreation() {
    console.log("Creating region summary per article date")
    await this.regionSummaryService.createOneSummaryPerArticleDateAndRegion()

    console.log("Creating special summary per role and region")
    await this.specialSummaryService.createAllSummaries()
  }
}
