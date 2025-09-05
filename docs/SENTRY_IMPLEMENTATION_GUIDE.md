# Sentry Implementation Guide

This guide demonstrates how to properly implement Sentry functionality in the PantryPals application, including exception catching, tracing, and logging.

## Configuration

### Client-Side Configuration (`instrumentation-client.ts`)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://f01aaac48d35553c898042ab4d2d9090@o4509967497822208.ingest.us.sentry.io/4509967516303360",
  
  integrations: [
    Sentry.replayIntegration(),
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  
  tracesSampleRate: 1,
  
  // Enable logs to be sent to Sentry
  _experiments: {
    enableLogs: true,
  },
  
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,
});
```

### Server-Side Configuration (`sentry.server.config.ts`)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://f01aaac48d35553c898042ab4d2d9090@o4509967497822208.ingest.us.sentry.io/4509967516303360",
  
  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  
  tracesSampleRate: 1,
  
  // Enable logs to be sent to Sentry
  _experiments: {
    enableLogs: true,
  },
  
  debug: false,
});
```

## Exception Catching

Use `Sentry.captureException(error)` to capture exceptions and log errors in Sentry. This should be used in try-catch blocks or areas where exceptions are expected.

### Example: Frontend Exception Catching

```typescript
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

const handleExceptionExample = () => {
  try {
    // Simulate an error that might occur
    throw new Error("This is a simulated error for testing exception catching");
  } catch (error) {
    // Capture the exception in Sentry
    Sentry.captureException(error);
    
    // Log additional context
    logger.error("Exception caught and sent to Sentry", { 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};
```

### Example: Backend Exception Catching

```typescript
import * as Sentry from "@sentry/nextjs";

const { logger } = Sentry;

export async function GET() {
  try {
    // API logic here
    const result = await someAsyncOperation();
    return NextResponse.json(result);
  } catch (error) {
    // Log the error with context
    logger.error("API error occurred", {
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: "/api/example",
      timestamp: new Date().toISOString()
    });
    
    // Capture the exception in Sentry
    Sentry.captureException(error);
    
    // Re-throw or handle as appropriate
    throw error;
  }
}
```

## Tracing Examples

Spans should be created for meaningful actions within applications like button clicks, API calls, and function calls. Use the `Sentry.startSpan` function to create spans with meaningful names and operations.

### UI Interaction Tracing

```typescript
const handleButtonClick = () => {
  Sentry.startSpan(
    {
      op: "ui.click",
      name: "Test Button Click",
    },
    (span) => {
      const buttonType = "exception-test";
      const userAction = "button-click";

      // Add meaningful attributes to the span
      span.setAttribute("button.type", buttonType);
      span.setAttribute("user.action", userAction);
      span.setAttribute("timestamp", new Date().toISOString());

      // Perform the action
      doSomething();
    },
  );
};
```

### API Call Tracing

```typescript
const fetchUserData = async (userId: string) => {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async (span) => {
      try {
        span.setAttribute("http.method", "GET");
        span.setAttribute("http.url", `/api/users/${userId}`);
        
        const response = await fetch(`/api/users/${userId}`);
        
        span.setAttribute("http.status_code", response.status);
        span.setAttribute("http.response_size", response.headers.get("content-length") || "unknown");
        
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        span.setAttribute("error", true);
        span.setAttribute("error.message", error instanceof Error ? error.message : 'Unknown error');
        
        // Capture the exception
        Sentry.captureException(error);
        throw error;
      }
    },
  );
};
```

### Server-Side API Tracing

```typescript
export async function GET() {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/example",
    },
    async (span) => {
      try {
        // Add meaningful attributes to the span
        span.setAttribute("http.method", "GET");
        span.setAttribute("http.url", "/api/example");
        span.setAttribute("api.endpoint", "example");
        
        // Process the request
        const result = await processRequest();
        
        span.setAttribute("response.status", "success");
        return NextResponse.json(result);
      } catch (error) {
        span.setAttribute("error", true);
        span.setAttribute("error.name", error instanceof Error ? error.name : 'Unknown');
        span.setAttribute("error.message", error instanceof Error ? error.message : 'Unknown error');
        
        Sentry.captureException(error);
        throw error;
      }
    }
  );
}
```

## Logging

Sentry offers structured logging with different log levels. Use the logger from Sentry with meaningful context and structured data.

### Logger Configuration

```typescript
import * as Sentry from "@sentry/nextjs";

// Get the logger from Sentry
const { logger } = Sentry;
```

### Logging Examples

```typescript
// Trace level logging
logger.trace("Starting database connection", { database: "users" });

// Debug level logging with template literal
logger.debug(logger.fmt`Cache miss for user: ${userId}`);

// Info level logging
logger.info("Updated profile", { profileId: 345 });

// Warn level logging
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});

// Error level logging
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});

// Fatal level logging
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});
```

## Best Practices

### 1. Meaningful Span Names and Operations
- Use descriptive names that clearly indicate what the span represents
- Choose appropriate operations (`ui.click`, `http.client`, `http.server`, `db.query`, etc.)
- Include relevant context in span attributes

### 2. Structured Logging
- Always include relevant context in log messages
- Use consistent field names across your application
- Include timestamps and identifiers when relevant

### 3. Exception Handling
- Always capture exceptions with `Sentry.captureException()`
- Include relevant context when capturing exceptions
- Log errors before capturing them for additional context

### 4. Performance Considerations
- Use appropriate sampling rates for production
- Be mindful of the data you're sending to Sentry
- Consider using different sampling rates for different environments

### 5. Security
- Never log sensitive information (passwords, API keys, etc.)
- Be careful with user data in logs and spans
- Use Sentry's data scrubbing features for sensitive data

## Testing

Visit `/sentry-example-page` to test all the Sentry functionality:

1. **Exception Catching Example**: Demonstrates proper exception handling with `Sentry.captureException()`
2. **API Call Tracing Example**: Shows how to trace API calls with meaningful spans
3. **Logging Examples**: Demonstrates all log levels with structured data
4. **Original Example**: The original Sentry test functionality

## Monitoring

Check your Sentry dashboard at [https://nibbble.sentry.io/issues/?project=4509967516303360](https://nibbble.sentry.io/issues/?project=4509967516303360) to see:

- Captured exceptions and errors
- Performance traces and spans
- Structured logs from your application
- User session replays (if enabled)

## Integration with Existing Code

To integrate Sentry into existing components and API routes:

1. Import Sentry: `import * as Sentry from "@sentry/nextjs"`
2. Get the logger: `const { logger } = Sentry`
3. Wrap important operations with `Sentry.startSpan()`
4. Use `Sentry.captureException()` in catch blocks
5. Add structured logging with `logger.info()`, `logger.error()`, etc.

This implementation provides comprehensive error monitoring, performance tracking, and logging capabilities for the PantryPals application.
