import { NextRequest, NextResponse } from 'next/server';
import { createProductOnAccount, listProductsFromAccount } from '@/lib/stripe/connect';

/**
 * POST /api/stripe/connect/products
 * Creates a new product on a connected account
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      accountId, 
      name, 
      description, 
      priceInCents, 
      currency = 'usd' 
    } = await request.json();

    // Validate required fields
    if (!accountId || !name || !priceInCents) {
      return NextResponse.json(
        { error: 'Account ID, name, and price are required' },
        { status: 400 }
      );
    }

    // Create the product on the connected account
    const product = await createProductOnAccount(
      accountId,
      name,
      description,
      priceInCents,
      currency
    );

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        default_price: product.default_price,
        created: product.created,
      }
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/connect/products
 * Lists products from a connected account
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    // List products from the connected account
    const products = await listProductsFromAccount(accountId, limit);

    return NextResponse.json({
      success: true,
      products: products.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        default_price: product.default_price,
        created: product.created,
        active: product.active,
      }))
    });

  } catch (error) {
    console.error('Error listing products:', error);
    return NextResponse.json(
      { error: 'Failed to list products' },
      { status: 500 }
    );
  }
}
