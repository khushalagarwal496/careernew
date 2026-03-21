const http = require('http');

const PORT = 54321;
const SYNC_URL = `http://localhost:${PORT}/sync-opportunities`;

console.log('🔄 Starting Opportunity Sync...');

const req = http.request(SYNC_URL, { method: 'POST' }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success) {
                console.log(`✅ Sync Successful! Found ${result.count} items.`);
                // In a real prod environment, this output would be logged or piped to a DB
            } else {
                console.error('❌ Sync Failed:', result.error || 'Unknown error');
            }
        } catch (e) {
            console.error('❌ Error parsing sync response:', e.message);
        }
    });
});

req.on('error', (e) => {
    console.error(`❌ Request Error: ${e.message}`);
    console.log('Ensure the proxy server is running at http://localhost:54321');
});

req.end();
