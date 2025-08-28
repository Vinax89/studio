import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: Request): Promise<Response> {
  const { allowed } = checkRateLimit(req);
  if (!allowed) {
    return new Response('Too Many Requests', { status: 429 });
  }
  return new Response(JSON.stringify({ message: 'hello' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
