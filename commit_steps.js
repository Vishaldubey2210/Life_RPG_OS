const { execSync } = require('child_process');

const steps = [
  { add: 'package.json package-lock.json', msg: 'chore: install html2canvas dependency' },
  { add: 'src/components/layout/TopNav.tsx src/components/layout/NotificationBell.tsx', msg: 'feat: add TopNav and NotificationBell components' },
  { add: 'src/hooks/useParty.ts src/app/api/notifications/read/route.ts', msg: 'feat: add useParty hook and notifications API' },
  { add: 'src/app/party/page.tsx', msg: 'feat: implement full Party System with realtime updates' },
  { add: 'src/app/party/couple/page.tsx', msg: 'feat: add Couple Mode dashboard' },
  { add: 'src/app/party/join src/app/couple/join', msg: 'feat: add invite deep links' },
  { add: 'src/app/leaderboard src/components/layout/Sidebar.tsx', msg: 'feat: implement Leaderboard with tabs' },
  { add: 'src/app/profile', msg: 'feat: add public profile pages' }
];

console.log("Starting 8-step commit and push sequence...");

for (let i = 0; i < steps.length; i++) {
  const step = steps[i];
  console.log(`\n--- Step ${i + 1}/8: ${step.msg} ---`);
  try {
    execSync(`git add ${step.add}`, { stdio: 'inherit' });
    // Check if there are changes to commit
    const status = execSync('git status --porcelain').toString();
    if (status.trim().length > 0) {
      execSync(`git commit -m "${step.msg}"`, { stdio: 'inherit' });
      try {
        execSync(`git push`, { stdio: 'inherit' });
        console.log(`Push successful for step ${i + 1}`);
      } catch (pushErr) {
        console.log(`Commit successful, but push failed (maybe no remote or network issue)`);
      }
    } else {
      console.log(`No changes to commit for step ${i + 1}`);
    }
  } catch (e) {
    console.error(`Error in step ${i + 1}`);
  }
}

// Add any remaining untracked files just in case
console.log(`\n--- Final Cleanup Step ---`);
try {
  execSync(`git add .`, { stdio: 'inherit' });
  const status = execSync('git status --porcelain').toString();
  if (status.trim().length > 0) {
    execSync(`git commit -m "fix: remaining miscellaneous changes"`, { stdio: 'inherit' });
    try {
      execSync(`git push`, { stdio: 'inherit' });
    } catch(e) {}
  }
} catch (e) {}

console.log("\nDone!");
