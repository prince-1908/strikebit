import apiProxy from "@/services/apiProxy";

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false
  }
}
export default apiProxy.createHandler(process.env.DISTRIBRAIN_NODES_API_BASE_URL!, "^/api/proxy/nodes")