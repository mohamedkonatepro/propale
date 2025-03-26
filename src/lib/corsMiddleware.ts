import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
export const cors = Cors({
  methods: ['GET', 'HEAD', 'POST', "*"], // Allowed methods
  origin: '*', // Allow all origins
});
// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
const corsMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

export default corsMiddleware;
