// APE26 → YouTube Music export hop.
//
// Goal: turn a list of video ids into a TLGG… temp-playlist id + a music.youtube.com URL
// that opens the list in YouTube Music with a working Save button.
//
// Primary route — InnerTube (YouTube's own JSON API): POST /youtubei/v1/next with the
// first videoId and a protobuf `params` blob that is just base64( repeat: 0x2a, len, id ).
// The response contains the freshly minted TLGG queue id. API endpoints survive datacenter
// IPs, unlike the HTML routes below.
//
// Fallback route — youtube.com/watch_videos?video_ids=… answers with a 302 whose Location
// carries the TLGG id (redirect:'manual' exposes it). Works from residential IPs but
// Google's /sorry bot-check blocks it from most datacenter ranges, hence only a fallback.
//
// Deploy:  wrangler login  →  wrangler deploy  (run from this directory)
// Then set the *.workers.dev URL as WORKER in index.html's exportYouTube().

export default {
  async fetch(req) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors() });
    const ids = (new URL(req.url).searchParams.get('ids') || '')
      .split(',').map(s => s.trim()).filter(s => /^[\w-]{11}$/.test(s));
    if (!ids.length) return json({ error: 'no ids' }, 400);

    let listId = await viaInnerTube(ids).catch(() => null);
    if (!listId) listId = await viaRedirect(ids).catch(() => null);
    if (!listId) return json({ error: 'no_list' }, 502);

    return json({
      listId,
      musicUrl: 'https://music.youtube.com/watch?v=' + ids[0] + '&list=' + listId
    });
  }
};

async function viaInnerTube(ids) {
  const params = btoa(ids.map(id => '\x2a' + String.fromCharCode(id.length) + id).join(''));
  const r = await fetch('https://www.youtube.com/youtubei/v1/next', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: { client: { clientName: 'WEB', clientVersion: '2.20260701.00.00' } },
      videoId: ids[0],
      params
    })
  });
  if (!r.ok) return null;
  const m = (await r.text()).match(/TLGG[A-Za-z0-9_-]+/);
  return m ? m[0] : null;
}

async function viaRedirect(ids) {
  const r = await fetch('https://www.youtube.com/watch_videos?video_ids=' + ids.join(','), {
    redirect: 'manual',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'en-GB,en;q=0.9',
      'Cookie': 'SOCS=CAI; CONSENT=YES+'
    }
  });
  const m = (r.headers.get('location') || '').match(/[?&]list=(TLGG[A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

const cors = () => ({ 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' });
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', ...cors() } });
