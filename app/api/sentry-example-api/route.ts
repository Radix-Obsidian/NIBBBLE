import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

// Get the logger from Sentry
const { logger } = Sentry;

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// Enhanced API route with proper exception catching and tracing
export async function GET() {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/sentry-example-api",
    },
    async (span) => {
      try {
        // Add meaningful attributes to the span
        span.setAttribute("http.method", "GET");
        span.setAttribute("http.url", "/api/sentry-example-api");
        span.setAttribute("api.endpoint", "sentry-example");
        
        logger.info("Processing sentry example API request", {
          endpoint: "/api/sentry-example-api",
          method: "GET",
          timestamp: new Date().toISOString()
        });

        // Simulate some processing time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Simulate an error for demonstration
        const error = new SentryExampleAPIError("This error is raised on the backend called by the example page.");
        
        // Add error context to the span
        span.setAttribute("error", true);
        span.setAttribute("error.name", error.name);
        span.setAttribute("error.message", error.message);
        
        // Log the error before throwing
        logger.error("API error occurred", {
          error: error.message,
          endpoint: "/api/sentry-example-api",
          timestamp: new Date().toISOString()
        });
        
        // Capture the exception in Sentry
        Sentry.captureException(error);
        
        throw error;
      } catch (error) {
        // Additional error handling and logging
        logger.fatal("Fatal error in sentry example API", {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          endpoint: "/api/sentry-example-api"
        });
        
        // Re-throw the error to maintain the original behavior
        throw error;
      }
    }
  );
}
