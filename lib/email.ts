import nodemailer from "nodemailer";
import type { IOrder } from "@/models/Order";

function formatMoney(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

export async function sendOrderNotification(order: IOrder): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    console.warn(
      "GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping order notification email."
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;">${item.name} &times; ${item.quantity}</td>
          <td style="padding:6px 0; text-align:right;">${formatMoney(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="margin-bottom:4px;">New order from ${order.customerName}</h2>
      <p style="color:#666; margin-top:0;">Placed ${new Date(order.createdAt).toLocaleString()}</p>

      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        ${itemsHtml}
        <tr style="border-top:1px solid #ddd; font-weight:bold;">
          <td style="padding:8px 0;">Total</td>
          <td style="padding:8px 0; text-align:right;">${formatMoney(order.total)}</td>
        </tr>
      </table>

      <p><strong>Phone:</strong> ${order.phone}</p>
      ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ""}
      <p><strong>Delivery Address:</strong><br/>${order.address}</p>
      ${order.notes ? `<p><strong>Notes:</strong><br/>${order.notes}</p>` : ""}

      <p style="margin-top:24px;">
        <a href="https://your-site-url/admin/orders" style="color:#2563eb;">
          View in Admin Dashboard
        </a>
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Haq Brothers Shop" <${gmailUser}>`,
      to: gmailUser,
      subject: `New order from ${order.customerName} — ${formatMoney(order.total)}`,
      html,
    });
  } catch (error) {
    // Never let a failed email break order creation — the order is already
    // saved either way. Just log it so it's visible in server logs.
    console.error("Failed to send order notification email:", error);
  }
}