import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarCorreoRecuperacion(email, token) {
  const enlace = `${process.env.FRONTEND_URL}/restablecer/${token}`;

  await resend.emails.send({
    from: "Guess The Geo <onboarding@resend.dev>",
    to: email,
    subject: "Recupera tu contraseña — Guess The Geo",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${enlace}">Haz click aquí para elegir una nueva contraseña</a></p>
      <p>Si no fuiste tú, ignora este correo. El enlace expira en 1 hora.</p>
    `,
  });
}