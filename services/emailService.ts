// ─────────────────────────────────────────────────────────────────────────────
// Email service using Resend (https://resend.com)
// Free tier: 3,000 emails/month, no SMTP setup needed.
//
// SETUP (one time, 2 minutes):
//   1. Go to https://resend.com → sign up free
//   2. Go to API Keys → Create API Key → copy it below
//   3. In Resend dashboard → Domains → you can send from
//      "onboarding@resend.dev" for testing (no domain needed)
//      OR add your own domain for production
//   4. Replace RESEND_API_KEY and FROM_EMAIL below
// ─────────────────────────────────────────────────────────────────────────────

const RESEND_API_KEY = "re_BVeUCVWG_JKNfXB5Fp3T5ByLs4U2kpvD1"; // e.g. "re_abc123xyz..."
const FROM_EMAIL = "AllDayFade <onboarding@resend.dev>"; // use this for testing

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });
    const data = await res.json();
    if (!res.ok) console.warn("Email failed:", data);
    else console.log("Email sent:", data.id);
  } catch (err) {
    console.warn("Email error:", err);
  }
}

export function sendBookingConfirmEmail(p: {
  to_name: string; to_email: string; service: string; barber: string;
  date: string; time: string; price: string; duration: string; bookingId: string;
}) {
  sendEmail(
    p.to_email,
    "Booking Confirmed – AllDayFade",
    `<div style="font-family:sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:12px;max-width:480px">
      <h2 style="margin:0 0 4px">Booking Confirmed ✓</h2>
      <p style="color:#a1a1a1;margin:0 0 24px">with AllDayFade</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Service</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.service}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Barber</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.barber}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Date & Time</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.date} at ${p.time}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Duration</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a">${p.duration}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Total</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.price}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0">Booking ID</td>
            <td style="padding:10px 0;font-weight:700;letter-spacing:1px">${p.bookingId}</td></tr>
      </table>
      <p style="color:#a1a1a1;font-size:13px;margin-top:24px">
        Vinzon Street Obrero, ALT BUILDING Second floor Davao City, Davao Del Sur 8000
      </p>
    </div>`
  );
}

export function sendRescheduleEmail(p: {
  to_name: string; to_email: string; service: string; barber: string;
  new_date: string; new_time: string;
}) {
  sendEmail(
    p.to_email,
    "Appointment Rescheduled – AllDayFade",
    `<div style="font-family:sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:12px;max-width:480px">
      <h2 style="margin:0 0 4px">Appointment Rescheduled</h2>
      <p style="color:#a1a1a1;margin:0 0 24px">with AllDayFade</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Service</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.service}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Barber</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.barber}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0">New Date & Time</td>
            <td style="padding:10px 0;font-weight:700">${p.new_date} at ${p.new_time}</td></tr>
      </table>
    </div>`
  );
}

export function sendCancelEmail(p: {
  to_name: string; to_email: string; service: string; barber: string;
  date: string; time: string; bookingId: string;
}) {
  sendEmail(
    p.to_email,
    "Appointment Cancelled – AllDayFade",
    `<div style="font-family:sans-serif;background:#0d0d0d;color:#fff;padding:32px;border-radius:12px;max-width:480px">
      <h2 style="margin:0 0 4px">Appointment Cancelled</h2>
      <p style="color:#a1a1a1;margin:0 0 24px">with AllDayFade</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Service</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.service}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Barber</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;font-weight:700">${p.barber}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0;border-bottom:1px solid #2a2a2a">Was scheduled</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a">${p.date} at ${p.time}</td></tr>
        <tr><td style="color:#a1a1a1;padding:10px 0">Booking ID</td>
            <td style="padding:10px 0">${p.bookingId}</td></tr>
      </table>
      <p style="color:#a1a1a1;font-size:13px;margin-top:24px">
        If you'd like to rebook, open the AllDayFade app anytime.
      </p>
    </div>`
  );
}
