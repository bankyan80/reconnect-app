const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push(msg.type() + ': ' + msg.text()));

  await page.goto('https://cari-app-rho.vercel.app', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Count initial posts
  const beforeCount = await page.evaluate(() => document.querySelectorAll('#posts-grid .card').length);
  console.log('Posts before:', beforeCount);

  // Check if realtime subscription is active
  const channelState = await page.evaluate(() => {
    if (DashboardPage._channel) {
      return { exists: true, topic: DashboardPage._channel.topic };
    }
    return { exists: false };
  });
  console.log('Realtime channel:', JSON.stringify(channelState));

  // Insert a test post via Supabase client
  const insertResult = await page.evaluate(async () => {
    try {
      const { data, error } = await supabase.from('posts').insert({
        full_name: 'TEST REALTIME ' + Date.now(),
        description: 'Test post for realtime verification',
        status: 'approved',
        reporter_name: 'Test Bot',
        reporter_relation: 'Test',
        reporter_phone: '08000000000'
      }).select().single();
      if (error) return { error: error.message };
      return { id: data.id, name: data.full_name };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('Insert result:', JSON.stringify(insertResult));

  // Wait for realtime to deliver
  await page.waitForTimeout(3000);

  // Count posts after
  const afterCount = await page.evaluate(() => document.querySelectorAll('#posts-grid .card').length);
  console.log('Posts after:', afterCount);
  console.log('Auto-updated:', afterCount > beforeCount ? 'YES' : 'NO');

  // Cleanup: delete test post
  if (insertResult.id) {
    await page.evaluate(async (id) => {
      await supabase.from('posts').delete().eq('id', id);
    }, insertResult.id);
    console.log('Test post cleaned up');
  }

  if (logs.length) {
    console.log('\nConsole logs:');
    logs.filter(l => l.includes('realtime') || l.includes('Realtime') || l.includes('postgres_changes')).forEach(l => console.log(' ', l));
  }

  await browser.close();
})().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
