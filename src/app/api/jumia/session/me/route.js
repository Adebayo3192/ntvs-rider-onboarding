import { NextResponse } from 'next/server';
import { getJumiaRider, jumiaUnauthorized } from '@/lib/jumiaAuth';

export async function GET(request) {
  const rider = await getJumiaRider(request);
  if (!rider) return jumiaUnauthorized();

  return NextResponse.json({ id: rider.id, name: rider.name });
}
