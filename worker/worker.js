// APE26 → YouTube Music export hop.
//
// youtube.com/watch_videos?video_ids=… answers with a 302 whose Location carries a TLGG…
// temp-playlist id. Browsers can't read that cross-origin redirect; Workers can
// (redirect:'manual' exposes the Location header). We hand back the id plus a
// music.youtube.com URL that opens the list in YouTube Music with a working Save button.
//
// Deploy:  wrangler login  →  wrangler deploy  (run from this directory)
// Then set the *.workers.dev URL as WORKER in index.html's exportYouTube().

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors() });
    const ids = (new URL(req.url).searchParams.get('ids') || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    if (!ids.length) return json({ error: 'no ids' }, 400);

    const r = await fetch('https://www.youtube.com/watch_videos?video_ids=' + ids.join(','), {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-GB,en;q=0.9',
        // If a datacenter IP trips the consent gate ("no_list" with a consent.youtube.com
        // location), uncomment and redeploy:
        // 'Cookie': 'SOCS=CAI; CONSENT=YES+'
      }
    });

    const loc = r.headers.get('location') || '';
    const m = loc.match(/[?&]list=([^&]+)/);
    if (!m) return json({ error: 'no_list', status: r.status, location: loc }, 502);

    return json({
      listId: m[1],
      musicUrl: 'https://music.youtube.com/watch?v=' + ids[0] + '&list=' + m[1]
    });
  }
};

const cors = () => ({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', ...cors() } });
