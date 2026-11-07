export async function POST() {
  return Response.json({ error: 'Verification fixture: no AI provider is called.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
}
