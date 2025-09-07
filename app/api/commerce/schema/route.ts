import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin client not available' },
        { status: 500 }
      );
    }

    // Read the commerce schema SQL file
    const schemaPath = join(process.cwd(), 'scripts', 'create-commerce-schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');

    // Execute the schema creation
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: schemaSql
    });

    if (error) {
      console.error('Schema creation error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Commerce schema created successfully'
    });

  } catch (error) {
    console.error('Failed to create commerce schema:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create commerce schema' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Commerce schema endpoint - POST to create schema',
    endpoint: '/api/commerce/schema'
  });
}