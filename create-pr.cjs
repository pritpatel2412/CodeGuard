require('dotenv').config();
const { Octokit } = require('@octokit/rest');

async function createPR() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  
  try {
    const { data } = await octokit.pulls.create({
      owner: 'pritpatel2412',
      repo: 'CodeGuard',
      title: 'Feature/admin panel dashboard',
      head: 'feature/admin-panel',
      base: 'main',
      body: 'This PR adds the Admin Dashboard with real-time metrics, system health, and audit logs.',
    });
    console.log(`Successfully created PR: ${data.html_url}`);
  } catch (error) {
    if (error.status === 422 && error.message.includes('A pull request already exists')) {
      console.log('A pull request already exists for this branch!');
      // Find the existing PR
      const { data: pulls } = await octokit.pulls.list({
        owner: 'pritpatel2412',
        repo: 'CodeGuard',
        state: 'open',
        head: 'pritpatel2412:feature/admin-panel'
      });
      if (pulls.length > 0) {
        console.log(`Existing PR URL: ${pulls[0].html_url}`);
      }
    } else {
      console.error('Error creating PR:', error.message);
    }
  }
}

createPR();
