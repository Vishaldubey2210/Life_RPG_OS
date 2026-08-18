export const day3NudgeEmail = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<body style="background:#08080F;color:#F1F0FF;font-family:'Segoe UI',sans-serif;padding:32px;max-width:520px;margin:0 auto;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:48px;margin-bottom:8px;">⚠️</div>
    <h1 style="color:#F59E0B;font-size:20px;font-weight:800;margin:0;letter-spacing:1px;">LIFE RPG OS</h1>
  </div>
  <h2 style="color:#F1F0FF;font-size:19px;margin-bottom:12px;">${name}, your streak hasn't started yet.</h2>
  <p style="color:#9B99B8;line-height:1.7;margin-bottom:16px;">
    Most players who don't complete their first quest within 3 days never return.
    Your character is still at Level 1, stats untouched, potential untapped.
  </p>
  <div style="background:#1A0A0A;border:1px solid #EF444455;border-left:3px solid #EF4444;border-radius:12px;padding:18px;margin:20px 0;">
    <p style="color:#EF4444;font-weight:700;font-size:13px;margin:0 0 6px;">DON'T BE MOST PEOPLE</p>
    <p style="color:#9B99B8;margin:0;font-size:14px;line-height:1.6;">Your character is waiting. One completed quest changes everything. Start there.</p>
  </div>
  <div style="text-align:center;margin:28px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://life-rpg-os-chi.vercel.app'}/quests"
       style="background:#EF4444;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;display:inline-block;">
      Complete Your First Quest →
    </a>
  </div>
  <p style="color:#5C5A7A;font-size:11px;text-align:center;">Life RPG OS · <a href="#" style="color:#5C5A7A;">Unsubscribe</a></p>
</body>
</html>
`

export const day7ReportEmail = (name: string, stats: {
  questsCompleted: number
  xpEarned: number
  level: number
  streak: number
}) => `
<!DOCTYPE html>
<html lang="en">
<body style="background:#08080F;color:#F1F0FF;font-family:'Segoe UI',sans-serif;padding:32px;max-width:520px;margin:0 auto;">
  <h1 style="color:#F59E0B;font-size:20px;font-weight:800;text-align:center;margin-bottom:4px;">⚡ WEEK 1 RPG REPORT</h1>
  <p style="color:#9B99B8;text-align:center;font-size:13px;margin-bottom:24px;">Here's how ${name} performed this week</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
    <div style="background:#13131F;border:1px solid #7C3AED44;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#F59E0B;">${stats.questsCompleted}</div>
      <div style="color:#9B99B8;font-size:11px;margin-top:4px;">Quests Completed</div>
    </div>
    <div style="background:#13131F;border:1px solid #7C3AED44;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#7C3AED;">${stats.xpEarned}</div>
      <div style="color:#9B99B8;font-size:11px;margin-top:4px;">XP Earned</div>
    </div>
    <div style="background:#13131F;border:1px solid #7C3AED44;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#22C55E;">Lv. ${stats.level}</div>
      <div style="color:#9B99B8;font-size:11px;margin-top:4px;">Current Level</div>
    </div>
    <div style="background:#13131F;border:1px solid #7C3AED44;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#F59E0B;">${stats.streak}</div>
      <div style="color:#9B99B8;font-size:11px;margin-top:4px;">Day Streak 🔥</div>
    </div>
  </div>
  <div style="text-align:center;margin:24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://life-rpg-os-chi.vercel.app'}/dashboard"
       style="background:linear-gradient(135deg,#7C3AED,#9F67FF);color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;display:inline-block;">
      View Full Dashboard ⚔️
    </a>
  </div>
  <p style="color:#5C5A7A;font-size:11px;text-align:center;">Life RPG OS · <a href="#" style="color:#5C5A7A;">Unsubscribe</a></p>
</body>
</html>
`

export const day30ComebackEmail = (name: string, level: number, xp: number) => `
<!DOCTYPE html>
<html lang="en">
<body style="background:#08080F;color:#F1F0FF;font-family:'Segoe UI',sans-serif;padding:32px;max-width:520px;margin:0 auto;">
  <div style="text-align:center;margin-bottom:24px;">
    <div style="font-size:52px;">👑</div>
  </div>
  <h2 style="color:#F1F0FF;font-size:19px;text-align:center;margin-bottom:12px;">${name}, your character is still here.</h2>
  <p style="color:#9B99B8;line-height:1.7;text-align:center;margin-bottom:20px;">
    Level <strong style="color:#F59E0B;">${level}</strong> · <strong style="color:#7C3AED;">${xp} XP</strong> already earned.
    <br/>All your progress. Intact. Waiting.
  </p>
  <div style="background:#13131F;border:1px solid #F59E0B33;border-radius:12px;padding:18px;margin:20px 0;text-align:center;">
    <p style="color:#F59E0B;font-weight:700;margin:0 0 8px;">Your party misses you. Your streak wants to restart.</p>
    <p style="color:#9B99B8;font-size:14px;margin:0;">Come back. Level up. The quest continues.</p>
  </div>
  <div style="text-align:center;margin:24px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://life-rpg-os-chi.vercel.app'}/dashboard"
       style="background:linear-gradient(135deg,#F59E0B,#D97706);color:#000;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:800;font-size:14px;display:inline-block;">
      Resume Your Journey ⚔️
    </a>
  </div>
  <p style="color:#5C5A7A;font-size:11px;text-align:center;">Life RPG OS · <a href="#" style="color:#5C5A7A;">Unsubscribe</a></p>
</body>
</html>
`
