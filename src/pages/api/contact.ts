import type { APIRoute } from "astro";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(import.meta.env.SENDGRID_API_KEY);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  console.log(data);
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

  const sgMailMessage = {
    to: ['dev@hasanirogers.me', 'deificarts@gmail.com'],
    from: email,
    subject: user + ' sent a message!',
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(sgMailMessage);
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("SendGrid Error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Failed to send email." }),
      { status: 500 }
    );
  }
};
