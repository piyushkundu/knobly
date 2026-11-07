export function GET() {
  return Response.json({error:'News refresh is disabled in this isolated Preview.'}, {status:503,headers:{'Cache-Control':'no-store'}});
}
