const fetch = require('node-fetch');

async function testFetch() {
  try {
    const res = await fetch('http://localhost:3000/api/tech-news?refresh=true');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
testFetch();
