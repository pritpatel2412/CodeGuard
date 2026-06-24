import { spawn } from 'child_process';

const child = spawn('npx.cmd', ['drizzle-kit', 'push'], { stdio: ['pipe', 'inherit', 'inherit'], shell: true });

let enterCount = 0;
const interval = setInterval(() => {
  child.stdin.write('\r\n');
  enterCount++;
  if (enterCount > 10) {
    clearInterval(interval);
    child.stdin.end();
  }
}, 3000);

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
  clearInterval(interval);
});
