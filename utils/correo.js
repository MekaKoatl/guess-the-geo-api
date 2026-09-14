// NOTA: En modo prueba, Resend (con el remitente onboarding@resend.dev) solo
// puede enviar correos a la dirección con la que se registró la cuenta Resend.
// Para enviar a cualquier usuario en producción hace falta verificar un dominio
// propio en Resend y cambiar el remitente "from" a una dirección de ese dominio.



import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarCorreoRecuperacion(email, token) {
  const enlace = `${process.env.FRONTEND_URL}/restablecer/${token}`;

  const { data, error } = await resend.emails.send({
    from: "Guess The Geo <onboarding@resend.dev>",
    to: email,
    subject: "Recupera tu contraseña — Guess The Geo",
    html: `
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${enlace}">Haz click aquí para elegir una nueva contraseña</a></p>
      <p>Si no fuiste tú, ignora este correo. El enlace expira en 1 hora.</p>
    `,
  });

  if (error) {
    console.error("Error de Resend:", error);
  } else {
    console.log("Correo enviado, id:", data?.id);
  }
}