import emailjs from "@emailjs/browser";

// EmailJS publishable credentials
const SERVICE_ID = "service_elhgjbq";
const PUBLIC_KEY = "LMm4j4QgBSHZSeB-D";

// Template IDs
export const TEMPLATES = {
  welcomeEmail: "template_qfdy5nq",
} as const;

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

/**
 * Send the welcome email after a user claims their username (Step 1).
 */
export async function sendWelcomeEmail(params: {
  toEmail: string;
  username: string;
  profileUrl: string;
}) {
  return emailjs.send(SERVICE_ID, TEMPLATES.welcomeEmail, {
    to_email: params.toEmail,
    username: params.username,
    profile_url: params.profileUrl,
  });
}

/**
 * Generic send helper for future templates (e.g. contact forms).
 */
export async function sendEmail(
  templateId: string,
  templateParams: Record<string, unknown>,
) {
  return emailjs.send(SERVICE_ID, templateId, templateParams);
}
