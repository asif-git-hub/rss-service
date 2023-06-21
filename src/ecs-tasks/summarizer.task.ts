import { SummaryOrchestratorService } from "../services/summary.orchestrator.service"

const service = new SummaryOrchestratorService()

service
  .orchestrateSummaryCreation()
  .then(() => console.log("done"))
  .catch((e) => {
    console.error(e)
  })
