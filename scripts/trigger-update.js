async function trigger() {
  const secret = 'dev-lions-2026';
  const url = 'https://ranking-lions-weyhausen.vercel.app/api/update-snapshot';
  
  console.log(`Triggering update at ${url}...`);
  try {
    const r = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ secret }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await r.json();
    console.log('Success:', data);
  } catch (e) {
    console.error('Failed:', e);
  }
}
trigger();
