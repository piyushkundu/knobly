import fetch from 'node-fetch';

async function test() {
  const key = 'sk_yq1asfkz_Mxp3sv11XPplvHo3HlXpmcvN';
  const url = 'https://api.sarvam.ai/chat/completions';
  const url_v1 = 'https://api.sarvam.ai/v1/chat/completions';
  
  try {
      const res = await fetch(url_v1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-subscription-key': key, 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: 'sarvam-30b-16k', // Typical model name for Sarvam or even 'sarvam-2b'
          messages: [{ role: 'user', content: 'Say hello in 1 word' }]
        })
      });
      console.log('STATUS:', res.status);
      console.log('RESPONSE:', await res.text());
  } catch(e) {}
}
test();
