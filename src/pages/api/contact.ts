import type { APIRoute } from "astro";
import 'dotenv/config'
import nodemailer from "nodemailer";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { message, email, phone, user } = data;

  const textContent = `
    ${user} wrote the following: \n
    ${message} \n
    ----------------------------------------- \n
    Email: ${email} \n
    Phone: ${phone} \n
  ` ;

  const htmlContent = `
    <h3>${user} wrote the following:</h3>
    <hr />
    <article>
      ${message}
    </article>
    <hr />
    <div>Email: ${email}</div>
    <div>Phone: ${phone}</div>
  `;

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER, // sender address
      to: "dev@hasanirogers.me, contact@deificarts.com", // list of receivers
      subject: user + ' sent a message!', // Subject line
      text: textContent, // plain text body
      html: htmlContent, // html body
    });

    if (info.response.includes('Ok')) {
      return new Response(
        JSON.stringify({ success: true, message: "Message sent successfully!" }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Failed to send email." }),
      { status: 400 }
    );
  } catch(error) {
    return new Response(
      JSON.stringify({ success: false, message: "An internal server error occurred." }),
      { status: 500 })
  }
}
