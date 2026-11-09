import http from 'node:http';
import assert from 'node:assert/strict';

// Create a server returning HTTP 500 JSON
const server500Json = http.createServer((req, res) => {
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal DB failure' } }));
});

// Create a server returning HTTP 502 HTML (e.g. Render/Cloudflare Bad Gateway)
const server502Html = http.createServer((req, res) => {
  res.writeHead(502, { 'Content-Type': 'text/html' });
  res.end('<html><body>502 Bad Gateway</body></html>');
});

async function run() {
  await new Promise(r => server500Json.listen(5801, '127.0.0.1', r));
  await new Promise(r => server502Html.listen(5802, '127.0.0.1', r));

  console.log('Testing Chat Store error handling for 500 JSON and 502 HTML:');

  // Case 1: 500 JSON
  {
    const messages = [];
    let isStreaming = false;
    let queryStart = Date.now();

    const response = await fetch('http://127.0.0.1:5801/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.status === 429) {
      // not 429
    } else if (contentType.includes('application/json')) {
      const json = await response.json();
      if (json.success && json.data) {
        messages.push({ role: 'assistant', content: json.data.answer });
      }
      isStreaming = false;
    }

    console.log('Case 1 (500 JSON) messages length:', messages.length);
    console.log('Case 1 messages:', messages);
    assert.equal(messages.length, 0, 'Confirmed: Chat Store produces ZERO messages when server returns JSON error!');
  }

  // Case 2: 502 HTML
  {
    const messages = [];
    let isStreaming = false;
    let currentStreamContent = '';
    let queryStart = Date.now();

    const response = await fetch('http://127.0.0.1:5802/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test' }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // not json
    } else {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          streamBuffer += decoder.decode(value, { stream: true });
          const lines = streamBuffer.split('\n\n');
          streamBuffer = lines.pop() || '';
          for (const block of lines) {
            for (const line of block.split('\n')) {
              if (line.startsWith('data: ')) {
                // none
              }
            }
          }
        }
      }
      messages.push({
        role: 'assistant',
        content: currentStreamContent || 'Response complete.',
      });
    }

    console.log('Case 2 (502 HTML) messages:', messages);
    assert.equal(messages[0].content, 'Response complete.', 'Confirmed: Chat Store reports "Response complete." on 502 Bad Gateway!');
  }

  server500Json.close();
  server502Html.close();
  console.log('All error reproduction tests passed successfully!');
}

run();
