"use client";

import Head from "next/head";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect } from "react";

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

// Get the logger from Sentry
const { logger } = Sentry;

export default function Page() {
  const [hasSentError, setHasSentError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  
  useEffect(() => {
    async function checkConnectivity() {
      const result = await Sentry.diagnoseSdkConnectivity();
      setIsConnected(result !== 'sentry-unreachable');
    }
    checkConnectivity();
  }, []);

  // Example: Exception catching with proper error handling
  const handleExceptionExample = () => {
    try {
      // Simulate an error that might occur
      throw new Error("This is a simulated error for testing exception catching");
    } catch (error) {
      // Capture the exception in Sentry
      Sentry.captureException(error);
      setHasSentError(true);
      logger.error("Exception caught and sent to Sentry", { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Example: UI interaction tracing
  const handleTestButtonClick = () => {
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

        logger.info("Button clicked", { buttonType, userAction });
        handleExceptionExample();
      },
    );
  };

  // Example: API call tracing
  const handleApiCallExample = async () => {
    return Sentry.startSpan(
      {
        op: "http.client",
        name: "GET /api/sentry-example-api",
      },
      async (span) => {
        try {
          span.setAttribute("http.method", "GET");
          span.setAttribute("http.url", "/api/sentry-example-api");
          
          logger.debug("Making API call to sentry example endpoint");
          
          const response = await fetch("/api/sentry-example-api");
          
          span.setAttribute("http.status_code", response.status);
          span.setAttribute("http.response_size", response.headers.get("content-length") || "unknown");
          
          if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
          }
          
          logger.info("API call successful", { 
            status: response.status,
            url: "/api/sentry-example-api"
          });
          
          return response;
        } catch (error) {
          span.setAttribute("error", true);
          span.setAttribute("error.message", error instanceof Error ? error.message : 'Unknown error');
          
          logger.error("API call failed", { 
            error: error instanceof Error ? error.message : 'Unknown error',
            url: "/api/sentry-example-api"
          });
          
          // Capture the exception
          Sentry.captureException(error);
          throw error;
        }
      },
    );
  };

  // Example: Logging with different levels
  const handleLoggingExamples = () => {
    const userId = "user_123";
    const profileId = 345;
    const endpoint = "/api/results/";
    const orderId = "order_123";
    const amount = 99.99;

    // Trace level logging
    logger.trace("Starting database connection", { database: "users" });
    
    // Debug level logging with template literal
    logger.debug(logger.fmt`Cache miss for user: ${userId}`);
    
    // Info level logging
    logger.info("Updated profile", { profileId });
    
    // Warn level logging
    logger.warn("Rate limit reached for endpoint", {
      endpoint,
      isEnterprise: false,
    });
    
    // Error level logging
    logger.error("Failed to process payment", {
      orderId,
      amount,
    });
    
    // Fatal level logging
    logger.fatal("Database connection pool exhausted", {
      database: "users",
      activeConnections: 100,
    });

    // Update UI to show logs were sent
    setLogMessages([
      "Trace: Starting database connection",
      "Debug: Cache miss for user: user_123",
      "Info: Updated profile",
      "Warn: Rate limit reached for endpoint",
      "Error: Failed to process payment",
      "Fatal: Database connection pool exhausted"
    ]);
  };

  return (
    <div>
      <Head>
        <title>sentry-example-page</title>
        <meta name="description" content="Test Sentry for your Next.js app!" />
      </Head>

      <main>
        <div className="flex-spacer" />
        <svg height="40" width="40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.85 2.995a3.698 3.698 0 0 1 1.353 1.354l16.303 28.278a3.703 3.703 0 0 1-1.354 5.053 3.694 3.694 0 0 1-1.848.496h-3.828a31.149 31.149 0 0 0 0-3.09h3.815a.61.61 0 0 0 .537-.917L20.523 5.893a.61.61 0 0 0-1.057 0l-3.739 6.494a28.948 28.948 0 0 1 9.63 10.453 28.988 28.988 0 0 1 3.499 13.78v1.542h-9.852v-1.544a19.106 19.106 0 0 0-2.182-8.85 19.08 19.08 0 0 0-6.032-6.829l-1.85 3.208a15.377 15.377 0 0 1 6.382 12.484v1.542H3.696A3.694 3.694 0 0 1 0 34.473c0-.648.17-1.286.494-1.849l2.33-4.074a8.562 8.562 0 0 1 2.689 1.536L3.158 34.17a.611.611 0 0 0 .538.917h8.448a12.481 12.481 0 0 0-6.037-9.09l-1.344-.772 4.908-8.545 1.344.77a22.16 22.16 0 0 1 7.705 7.444 22.193 22.193 0 0 1 3.316 10.193h3.699a25.892 25.892 0 0 0-3.811-12.033 25.856 25.856 0 0 0-9.046-8.796l-1.344-.772 5.269-9.136a3.698 3.698 0 0 1 3.2-1.849c.648 0 1.285.17 1.847.495Z" fill="currentcolor"/>
        </svg>
        <h1>
          sentry-example-page
        </h1>

        <p className="description">
          Test Sentry functionality with comprehensive examples. View results on the Sentry <a target="_blank" href="https://nibbble.sentry.io/issues/?project=4509967516303360">Issues Page</a>.
          For more details about setting up Sentry, <a target="_blank"
           href="https://docs.sentry.io/platforms/javascript/guides/nextjs/">read our docs</a>.
        </p>

        <div className="button-group">
          <button
            type="button"
            onClick={handleTestButtonClick}
            disabled={!isConnected}
            className="example-button"
          >
            <span>
              Exception Catching Example
            </span>
          </button>

          <button
            type="button"
            onClick={handleApiCallExample}
            disabled={!isConnected}
            className="example-button"
          >
            <span>
              API Call Tracing Example
            </span>
          </button>

          <button
            type="button"
            onClick={handleLoggingExamples}
            disabled={!isConnected}
            className="example-button"
          >
            <span>
              Logging Examples
            </span>
          </button>

          <button
            type="button"
            onClick={async () => {
              await Sentry.startSpan({
                name: 'Example Frontend/Backend Span',
                op: 'test'
              }, async () => {
                const res = await fetch("/api/sentry-example-api");
                if (!res.ok) {
                  setHasSentError(true);
                }
              });
              throw new SentryExampleFrontendError("This error is raised on the frontend of the example page.");
            }}
            disabled={!isConnected}
            className="example-button"
          >
            <span>
              Original Example
            </span>
          </button>

          <button
            type="button"
            onClick={() => Sentry.showFeedbackDialog()}
            className="feedback-button"
          >
            <span>
              Send Feedback
            </span>
          </button>
        </div>

        {hasSentError ? (
          <p className="success">
            Error sent to Sentry.
          </p>
        ) : !isConnected ? (
          <div className="connectivity-error">
            <p>It looks like network requests to Sentry are being blocked, which will prevent errors from being captured. Try disabling your ad-blocker to complete the test.</p>
          </div>
        ) : (
          <div className="success_placeholder" />
        )}

        {logMessages.length > 0 && (
          <div className="log-messages">
            <h3>Log Messages Sent to Sentry:</h3>
            <ul>
              {logMessages.map((message, index) => (
                <li key={index} className="log-message">{message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex-spacer" />
      
      </main>

      <style>{`
        main {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 16px;
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
        }

        h1 {
          padding: 0px 4px;
          border-radius: 4px;
          background-color: rgba(24, 20, 35, 0.03);
          font-family: monospace;
          font-size: 20px;
          line-height: 1.2;
        }

        p {
          margin: 0;
          font-size: 20px;
        }

        a {
          color: #6341F0;
          text-decoration: underline;
          cursor: pointer;

          @media (prefers-color-scheme: dark) {
            color: #B3A1FF;
          }
        }

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 400px;
        }

        .example-button {
          border-radius: 8px;
          color: white;
          cursor: pointer;
          background-color: #553DB8;
          border: none;
          padding: 0;
          margin-top: 4px;

          & > span {
            display: inline-block;
            padding: 12px 16px;
            border-radius: inherit;
            font-size: 16px;
            font-weight: bold;
            line-height: 1;
            background-color: #7553FF;
            border: 1px solid #553DB8;
            transform: translateY(-4px);
          }

          &:hover > span {
            transform: translateY(-8px);
          }

          &:active > span {
            transform: translateY(0);
          }

          &:disabled {
	            cursor: not-allowed;
	            opacity: 0.6;
	
	            & > span {
	              transform: translateY(0);
	              border: none
	            }
	          }
        }

        .log-messages {
          margin-top: 20px;
          padding: 16px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          max-width: 500px;
          text-align: left;

          h3 {
            margin: 0 0 12px 0;
            font-size: 18px;
            color: #495057;
          }

          ul {
            margin: 0;
            padding-left: 20px;
          }

          .log-message {
            margin: 4px 0;
            font-size: 14px;
            color: #6c757d;
            font-family: monospace;
          }
        }

        .description {
          text-align: center;
          color: #6E6C75;
          max-width: 500px;
          line-height: 1.5;
          font-size: 20px;

          @media (prefers-color-scheme: dark) {
            color: #A49FB5;
          }
        }

        .flex-spacer {
          flex: 1;
        }

        .success {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 20px;
          line-height: 1;
          background-color: #00F261;
          border: 1px solid #00BF4D;
          color: #181423;
        }

        .success_placeholder {
          height: 46px;
        }

        .connectivity-error {
          padding: 12px 16px;
          background-color: #E50045;
          border-radius: 8px;
          width: 500px;
          color: #FFFFFF;
          border: 1px solid #A80033;
          text-align: center;
          margin: 0;
        }
        
        .connectivity-error a {
          color: #FFFFFF;
          text-decoration: underline;
        }

        .feedback-button {
          border-radius: 8px;
          color: white;
          cursor: pointer;
          background-color: #00F261;
          border: none;
          padding: 0;
          margin-top: 4px;

          & > span {
            display: inline-block;
            padding: 12px 16px;
            border-radius: inherit;
            font-size: 20px;
            font-weight: bold;
            line-height: 1;
            background-color: #00F261;
            border: 1px solid #00BF4D;
            transform: translateY(-4px);
          }

          &:hover > span {
            transform: translateY(-8px);
          }

          &:active > span {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
