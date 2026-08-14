import https from 'https';

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function test() {
  const url = 'https://datasets-server.huggingface.co/rows?dataset=starsofchance%2FPrimeVul&config=default&split=test&offset=0&length=1';
  try {
    const data = await fetchUrl(url);
    const json = JSON.parse(data);
    if (json.rows && json.rows.length > 0) {
      console.log(Object.keys(json.rows[0].row));
    } else {
      console.log(json);
    }
  } catch (e) {
    console.error(e);
  }
}
test();
