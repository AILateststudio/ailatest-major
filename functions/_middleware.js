export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const kv = env.AILATEST_WRITE_GUARD;
    const config = kv ? await kv.get('config', 'json').catch(() => null) : null;
    const autoTrip = kv ? await kv.get('paused:auto').catch(() => null) : null;
    if (config?.paused || config?.mode === 'all' || autoTrip) {
      return new Response(JSON.stringify({ ok: false, paused: true, reason: 'd1_writes_paused', message: '写入保护已触发，当前仅提供读取功能。' }), { status: 503, headers: { 'content-type': 'application/json; charset=utf-8', 'retry-after': '3600' } });
    }
  }
  return context.next();
}
