import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private fromAddress: string;
  private appUrl: string;

  constructor(private configService: ConfigService) {
    this.appUrl = this.configService.get('APP_URL', 'http://localhost:3002');
    this.fromAddress = this.configService.get(
      'SMTP_FROM',
      '"Mercado Simple" <noreply@mercadosimple.com.ar>',
    );

    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (smtpHost && smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(this.configService.get('SMTP_PORT', '587')),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      // Modo preview: crea una cuenta de prueba en Ethereal Email automáticamente
      this.initEtherealTransport();
    }
  }

  private async initEtherealTransport() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      this.logger.log(
        `Email en modo preview (Ethereal). Usuario: ${testAccount.user}`,
      );
    } catch {
      this.logger.warn('No se pudo inicializar el transporte de email.');
    }
  }

  private async send(to: string, subject: string, html: string): Promise<string | null> {
    if (!this.transporter) {
      this.logger.warn(`Email no enviado (sin transporte): ${subject} → ${to}`);
      return null;
    }
    try {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        this.logger.log(`Preview email: ${previewUrl}`);
      }
      return info.messageId;
    } catch (err) {
      this.logger.error(`Error al enviar email a ${to}: ${err.message}`);
      return null;
    }
  }

  // ── Recuperación de contraseña ───────────────────────────────────────────
  async sendPasswordReset(to: string, name: string, token: string): Promise<void> {
    const link = `${this.appUrl}/auth/reset-password/${token}`;
    const html = this.baseTemplate(`
      <h2 style="color:#2563EB;margin-bottom:8px">Recuperar contraseña</h2>
      <p>Hola <strong>${name}</strong>,</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Mercado Simple</strong>.</p>
      <p>Hacé clic en el botón para crear una nueva contraseña. El enlace es válido por <strong>1 hora</strong>.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${link}" style="background:#2563EB;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px">
          Restablecer contraseña
        </a>
      </div>
      <p style="font-size:13px;color:#6B7280">Si no solicitaste este cambio, podés ignorar este email de forma segura.</p>
      <p style="font-size:12px;color:#9CA3AF;margin-top:16px">O copiá este enlace en tu navegador:<br>
        <a href="${link}" style="color:#2563EB;word-break:break-all">${link}</a>
      </p>
    `);
    await this.send(to, 'Restablecer contraseña — Mercado Simple', html);
  }

  // ── Bienvenida al registrarse ────────────────────────────────────────────
  async sendWelcome(to: string, name: string): Promise<void> {
    const html = this.baseTemplate(`
      <h2 style="color:#2563EB;margin-bottom:8px">¡Bienvenido/a a Mercado Simple!</h2>
      <p>Hola <strong>${name}</strong>,</p>
      <p>Tu cuenta fue creada exitosamente. Ya podés empezar a comprar y vender en la plataforma más simple de Argentina 🎉</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${this.appUrl}" style="background:#2563EB;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px">
          Ir a Mercado Simple
        </a>
      </div>
      <p style="font-size:13px;color:#6B7280">
        Tu <strong>billetera virtual Pago Simple</strong> ya está activa. Podés cargar saldo, transferir y pagar de forma instantánea.
      </p>
    `);
    await this.send(to, '¡Bienvenido/a a Mercado Simple! 🎉', html);
  }

  // ── Confirmación de orden ────────────────────────────────────────────────
  async sendOrderConfirmation(
    to: string,
    name: string,
    orderId: string,
    total: number,
    items: Array<{ title: string; quantity: number; price: number }>,
  ): Promise<void> {
    const itemRows = items
      .map(
        (i) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB">${i.title}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;text-align:center">${i.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;text-align:right">$${Number(i.price).toLocaleString('es-AR')}</td>
          </tr>`,
      )
      .join('');

    const html = this.baseTemplate(`
      <h2 style="color:#10B981;margin-bottom:8px">✅ Pedido confirmado</h2>
      <p>Hola <strong>${name}</strong>, tu pedido fue recibido y está siendo procesado.</p>
      <p><strong>N° de orden:</strong> <code style="background:#F3F4F6;padding:2px 8px;border-radius:4px">${orderId.slice(0, 8).toUpperCase()}</code></p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#F9FAFB">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#6B7280">Producto</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#6B7280">Cant.</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;color:#6B7280">Precio</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;font-weight:700;text-align:right">Total:</td>
            <td style="padding:12px;font-weight:700;text-align:right;color:#2563EB">$${Number(total).toLocaleString('es-AR')}</td>
          </tr>
        </tfoot>
      </table>
      <div style="text-align:center;margin:24px 0">
        <a href="${this.appUrl}/perfil/pedidos" style="background:#2563EB;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600">
          Ver mis pedidos
        </a>
      </div>
    `);
    await this.send(to, `Pedido confirmado #${orderId.slice(0, 8).toUpperCase()} — Mercado Simple`, html);
  }

  // ── Notificación de transferencia recibida ───────────────────────────────
  async sendTransferReceived(
    to: string,
    name: string,
    amount: number,
    senderName: string,
    receiptNumber: string,
  ): Promise<void> {
    const html = this.baseTemplate(`
      <h2 style="color:#10B981;margin-bottom:8px">💸 Recibiste dinero</h2>
      <p>Hola <strong>${name}</strong>, te informamos que recibiste una transferencia en tu billetera.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:16px 0;text-align:center">
        <p style="font-size:13px;color:#6B7280;margin:0 0 4px">Monto recibido</p>
        <p style="font-size:32px;font-weight:800;color:#10B981;margin:0">$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
        <p style="font-size:13px;color:#6B7280;margin:8px 0 0">De: <strong>${senderName}</strong></p>
      </div>
      <p style="font-size:13px;color:#6B7280">N° comprobante: <strong>${receiptNumber}</strong></p>
      <div style="text-align:center;margin:24px 0">
        <a href="${this.appUrl}/mi-cuenta?tab=billetera" style="background:#10B981;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600">
          Ver mi billetera
        </a>
      </div>
    `);
    await this.send(to, `Recibiste $${Number(amount).toLocaleString('es-AR')} — Pago Simple`, html);
  }

  // ── Notificación de pago aprobado (vendedor) ─────────────────────────────
  async sendPaymentApproved(
    to: string,
    name: string,
    orderId: string,
    amount: number,
  ): Promise<void> {
    const html = this.baseTemplate(`
      <h2 style="color:#10B981;margin-bottom:8px">✅ Pago aprobado</h2>
      <p>Hola <strong>${name}</strong>, el pago de tu pedido fue aprobado exitosamente.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:16px 0;text-align:center">
        <p style="font-size:32px;font-weight:800;color:#10B981;margin:0">$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
        <p style="font-size:13px;color:#6B7280;margin:8px 0 0">Orden #${orderId.slice(0, 8).toUpperCase()}</p>
      </div>
      <div style="text-align:center;margin:24px 0">
        <a href="${this.appUrl}/vendedor/dashboard" style="background:#2563EB;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:600">
          Ver en mi panel
        </a>
      </div>
    `);
    await this.send(to, `Pago recibido $${Number(amount).toLocaleString('es-AR')} — Mercado Simple`, html);
  }

  // ── Plantilla base ───────────────────────────────────────────────────────
  private baseTemplate(content: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1E3A8A 0%,#2563EB 100%);padding:28px 40px;text-align:center">
            <span style="font-size:24px;font-weight:800;color:white;letter-spacing:-0.5px">MERCADO</span>
            <span style="font-size:24px;font-weight:300;color:#93C5FD;letter-spacing:-0.5px"> SIMPLE</span>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:36px 40px;color:#111827;font-size:15px;line-height:1.6">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #E5E7EB">
            <p style="font-size:12px;color:#9CA3AF;margin:0">
              © ${new Date().getFullYear()} Mercado Simple S.A. · Argentina<br>
              <a href="${this.appUrl}" style="color:#2563EB;text-decoration:none">mercadosimple.com.ar</a> ·
              <a href="${this.appUrl}/privacidad" style="color:#6B7280;text-decoration:none">Privacidad</a> ·
              <a href="${this.appUrl}/terminos" style="color:#6B7280;text-decoration:none">Términos</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }
}
