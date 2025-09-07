import { NextRequest, NextResponse } from 'next/server'
import { withAppRouterHighlight } from '@/app/_utils/app-router-highlight.config'

export const GET = withAppRouterHighlight(async function GET(
    request: NextRequest,
) {
    console.info('📝 Here: /api/app-router-trace/route.ts ⏰⏰⏰')
    
    const testData = {
        message: 'Success: /api/app-router-trace',
        timestamp: new Date().toISOString(),
        randomNumber: Math.random(),
        highlightConfig: {
            projectId: 've6yn6ng',
            serviceName: 'nibbble-alpha-server',
            environment: process.env.NODE_ENV
        },
        userAgent: request.headers.get('user-agent') || 'unknown',
        method: request.method,
        url: request.url,
        pathname: request.nextUrl.pathname
    };

    console.info('✅ App Router trace completed successfully');
    
    return NextResponse.json(testData);
})

// Optional: Add POST method for testing
export const POST = withAppRouterHighlight(async function POST(
    request: NextRequest,
) {
    try {
        const body = await request.json();
        console.info('📝 POST request to app-router-trace:', Object.keys(body || {}));
        
        return NextResponse.json({
            message: 'POST trace successful',
            receivedData: body,
            timestamp: new Date().toISOString(),
            method: request.method,
            url: request.url
        });
        
    } catch (error) {
        console.error('❌ POST request failed:', error);
        return NextResponse.json({ error: 'POST trace failed' }, { status: 500 });
    }
})