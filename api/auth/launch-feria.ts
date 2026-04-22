import { handleModuleLaunch } from "../modules/lib.js";

type VercelRequest = any;
type VercelResponse = any;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handleModuleLaunch(req, res, "feria");
}
