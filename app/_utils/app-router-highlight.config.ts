import { NextRequest, NextResponse } from 'next/server';

export function withAppRouterHighlight<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response | NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<Response | NextResponse> => {
    const startTime = Date.now();
    
    try {
      // Simple logging for request tracking
      console.log(`📊 [Highlight] Starting request: ${request.method} ${request.nextUrl.pathname}`);
      
      // Execute the handler
      const response = await handler(request, ...args);
      
      // Log successful completion
      const duration = Date.now() - startTime;
      const status = response instanceof NextResponse 
        ? response.status 
        : (response as Response).status;
        
      console.log(`✅ [Highlight] Completed request: ${request.method} ${request.nextUrl.pathname} - ${status} (${duration}ms)`);

      return response;
      
    } catch (error) {
      // Log errors
      const duration = Date.now() - startTime;
      console.error(`❌ [Highlight] Request failed: ${request.method} ${request.nextUrl.pathname} (${duration}ms)`, error);
      
      // Re-throw to let Next.js handle the error
      throw error;
    }
  };
}