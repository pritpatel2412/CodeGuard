import crypto from "crypto";

async function runWebhookTest() {
  const secret = "2c33420b-6b5c-40c5-8c97-126af97a8694";
  const repoId = "05479346-98a2-482b-8d48-caad980c569f";
  
  const payload = {
    action: "opened",
    pull_request: {
      number: 999,
      title: "Robust End-to-End Taint Test",
      html_url: "https://github.com/testuser/mock-taint-repo/pull/999",
      user: { login: "testuser" },
      head: { sha: "abcdef1234567890" },
      additions: 10,
      deletions: 0,
      changed_files: 2
    },
    repository: {
      name: "mock-taint-repo",
      owner: { login: "testuser" }
    }
  };

  const rawBody = JSON.stringify(payload);
  const signature = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;

  console.log("Triggering Webhook for repo:", repoId);
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/webhooks/github/${repoId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-github-event": "pull_request",
        "x-hub-signature-256": signature
      },
      body: rawBody
    });
    
    console.log("Webhook Response Status:", res.status);
    const text = await res.text();
    console.log("Webhook Response Body:", text);
    console.log("Check the 'npm run dev' terminal for orchestrator logs!");
  } catch (err) {
    console.error("Failed to trigger webhook:", err);
  }
}

runWebhookTest();
