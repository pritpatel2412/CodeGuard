import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const martianDir = path.join(__dirname, 'martian-benchmark/offline/golden_comments');
const casesDir = path.join(__dirname, 'cases');

if (!fs.existsSync(casesDir)) {
  fs.mkdirSync(casesDir, { recursive: true });
}

// Fetch helper
async function fetchPatch(url: string): Promise<string | null> {
  // Convert https://github.com/org/repo/pull/1 to https://github.com/org/repo/pull/1.patch
  const patchUrl = url.endsWith('.patch') ? url : `${url}.patch`;
  try {
    const response = await fetch(patchUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch ${patchUrl}: ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (e) {
    console.error(`Error fetching ${patchUrl}:`, e);
    return null;
  }
}

async function buildDataset() {
  const files = fs.readdirSync(martianDir).filter(f => f.endsWith('.json'));
  let caseIdCounter = 1;

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(martianDir, file), 'utf-8'));
    console.log(`Processing ${file} (${data.length} PRs)`);

    for (const pr of data) {
      // Use original_url if present, otherwise url
      let fetchUrl = pr.original_url || pr.url;
      // The martian benchmark sometimes uses forks like ai-code-review-evaluation/sentry-greptile
      // Try to get original if possible
      if (fetchUrl.includes('ai-code-review-evaluation')) {
        console.log(`Skipping fork PR (often missing): ${fetchUrl}`);
        continue;
      }
      
      console.log(`Fetching ${fetchUrl}...`);
      const patch = await fetchPatch(fetchUrl);
      if (!patch) {
        continue; // Skip if we can't get the diff
      }

      const caseIdStr = `case-${caseIdCounter.toString().padStart(3, '0')}`;
      const caseDir = path.join(casesDir, caseIdStr);
      fs.mkdirSync(caseDir, { recursive: true });

      // Save diff
      fs.writeFileSync(path.join(caseDir, 'diff.patch'), patch);

      // Save metadata
      const metadata = {
        pr_title: pr.pr_title,
        url: fetchUrl,
        file: file,
        comments: pr.comments,
      };
      fs.writeFileSync(path.join(caseDir, 'metadata.json'), JSON.stringify(metadata, null, 2));

      // Save golden comments as readable markdown
      const goldenMd = `# Golden Comments for ${pr.pr_title}\n\n${pr.comments.map((c: any) => `## [${c.severity}]\n${c.comment}\n`).join('\n')}`;
      fs.writeFileSync(path.join(caseDir, 'golden_comment.md'), goldenMd);

      console.log(`Saved ${caseIdStr}`);
      caseIdCounter++;
      
      // Artificial delay to prevent rate limiting from GitHub
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  console.log(`\nDataset built successfully with ${caseIdCounter - 1} cases.`);
}

buildDataset().catch(console.error);
