import { DateTime } from 'luxon';

function formatSlot(start: Date, end: Date, timeZoneId: string): string {
  let zone = timeZoneId;
  let localStart = DateTime.fromJSDate(start, { zone: 'utc' }).setZone(zone);
  let localEnd = DateTime.fromJSDate(end, { zone: 'utc' }).setZone(zone);

  if (!localStart.isValid || !localEnd.isValid) {
    localStart = DateTime.fromJSDate(start, { zone: 'utc' });
    localEnd = DateTime.fromJSDate(end, { zone: 'utc' });
  }

  return `${localStart.toFormat('cccc, LLLL d, yyyy')} · ${localStart.toFormat('h:mm a')} – ${localEnd.toFormat('h:mm a')}`;
}

export function confirmationEmail(d: {
  clinicName: string;
  toName: string;
  petName: string;
  reason: string;
  slotStart: Date;
  slotEnd: Date;
  timeZoneId: string;
  appointmentId: string;
}): string {
  const slot = formatSlot(d.slotStart, d.slotEnd, d.timeZoneId);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Appointment Confirmed</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#0ea5e9;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
<p style="margin:0;font-size:13px;color:#e0f2fe;letter-spacing:.05em;text-transform:uppercase;">${d.clinicName}</p>
<h1 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#fff;">You're booked!</h1></td></tr>
<tr><td style="background:#fff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
<p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">Hi ${d.toName}, your appointment for <strong>${d.petName}</strong> has been confirmed. A calendar invite has been sent to this email.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;"><p style="margin:0 0 2px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Date &amp; Time</p><p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${slot}</p></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;"><p style="margin:0 0 2px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Pet</p><p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${d.petName}</p></td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;"><p style="margin:0 0 2px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Reason</p><p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${d.reason}</p></td></tr>
<tr><td style="padding:16px 20px;"><p style="margin:0 0 2px;font-size:11px;color:#9ca3af;text-transform:uppercase;">Booking ID</p><p style="margin:0;font-size:12px;color:#6b7280;font-family:monospace;">${d.appointmentId}</p></td></tr>
</table>
<p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">Need to cancel or reschedule? Reply to this email and we'll take care of it.</p>
</td></tr>
<tr><td style="background:#f1f5f9;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px;text-align:center;"><p style="margin:0;font-size:12px;color:#9ca3af;">${d.clinicName} · Powered by SchedulingWL</p></td></tr>
</table></td></tr></table></body></html>`;
}

export function cancellationEmail(d: {
  clinicName: string;
  toName: string;
  petName: string;
  slotStart: Date;
  timeZoneId: string;
}): string {
  const slot = formatSlot(d.slotStart, new Date(d.slotStart.getTime() + 30 * 60 * 1000), d.timeZoneId);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Appointment Cancelled</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
<tr><td style="background:#64748b;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
<p style="margin:0;font-size:13px;color:#e2e8f0;text-transform:uppercase;">${d.clinicName}</p>
<h1 style="margin:8px 0 0;font-size:24px;font-weight:600;color:#fff;">Appointment Cancelled</h1></td></tr>
<tr><td style="background:#fff;padding:32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
<p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">Hi ${d.toName}, your appointment for <strong>${d.petName}</strong> on <strong>${slot}</strong> has been cancelled.</p>
<p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">To book a new appointment, visit our booking page or reply to this email.</p>
</td></tr>
<tr><td style="background:#f1f5f9;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px;text-align:center;"><p style="margin:0;font-size:12px;color:#9ca3af;">${d.clinicName} · Powered by SchedulingWL</p></td></tr>
</table></td></tr></table></body></html>`;
}
