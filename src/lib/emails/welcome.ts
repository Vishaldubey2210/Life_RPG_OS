export const welcomeEmail = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<body style="background:#08080F;color:#F1F0FF;font-family:'Segoe UI',sans-serif;padding:32px;max-width:520px;margin:0 auto;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="display:inline-block;width:56px;height:56px;background:linear-gradient(135deg,#7C3AED,#F59E0B);border-radius:14px;line-height:56px;font-size:28px;text-align:center;">⚔️</div>
    <h1 style="color:#F59E0B;font-size:22px;font-weight:800;margin:12px 0 0;letter-spacing:1px;">LIFE RPG OS</h1>
  </div>
  <h2 style="color:#F1F0FF;font-size:20px;margin-bottom:8px;">Welcome, ${name}! Your adventure begins. 🎮</h2>
  <p style="color:#9B99B8;line-height:1.7;margin-bottom:16px;">
    Your character has been created. Your stats are at zero. Your streak hasn't started yet.
    <br/><br/>
    But every legend starts exactly here.
  </p>
  <div style="background:#13131F;border:1px solid #7C3AED44;border-left:3px solid #7C3AED;border-radius:12px;padding:18px;margin:24px 0;">
    <p style="color:#C4A8FF;font-weight:700;margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Your First Quest:</p>
    <p style="color:#9B99B8;margin:0;font-size:14px;line-height:1.6;">Add 3 daily habits and complete them today. That's it. That's how every legend begins their journey.</p>
  </div>
  <div style="text-align:center;margin:32px 0;">
    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://life-rpg-os-chi.vercel.app'}/quests"
       style="background:linear-gradient(135deg,#7C3AED,#9F67FF);color:white;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:0.5px;display:inline-block;box-shadow:0 4px 20px rgba(124,58,237,0.35);">
      Begin Your Quest ⚔️
    </a>
  </div>
  <hr style="border:none;border-top:1px solid #1E1E35;margin:24px 0;"/>
  <p style="color:#5C5A7A;font-size:11px;text-align:center;">Life RPG OS · Level up your real life · <a href="#" style="color:#5C5A7A;">Unsubscribe</a></p>
</body>
</html>
`
