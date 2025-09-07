import { NextApiRequest, NextApiResponse } from 'next';

// Page Router compatible Highlight wrapper function
export function withPageRouterHighlight<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T> | T
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    
    try {
      // Simple logging for request tracking
      console.log(`📊 [Highlight] Starting request: ${req.method} ${req.url}`);
      
      // Execute the handler
      const result = await handler(req, res);
      
      // Log successful completion if response hasn't been sent yet
      if (!res.headersSent) {
        const duration = Date.now() - startTime;
        console.log(`✅ [Highlight] Completed request: ${req.method} ${req.url} (${duration}ms)`);
      }

      return result;
      
    } catch (error) {
      // Log errors
      const duration = Date.now() - startTime;
      console.error(`❌ [Highlight] Request failed: ${req.method} ${req.url} (${duration}ms)`, error);
      
      // Re-throw to let Next.js handle the error
      throw error;
    }
  };
}