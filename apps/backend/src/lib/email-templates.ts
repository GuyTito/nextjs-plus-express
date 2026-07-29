export type EmailTemplateFn<T = Record<string, unknown>> = (
  data: T,
) => { subject: string; html: string; text: string };

export const emailVerificationTemplate: EmailTemplateFn<{ code: string }> = ({ code }) => ({
  subject: "Verify your email",
  html: `<h2>Verify your email</h2><p>Your code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`,
  text: `Your verification code is ${code}. It expires in 15 minutes.`,
});

export const passwordResetTemplate: EmailTemplateFn<{ code: string }> = ({ code }) => ({
  subject: "Your verification code",
  html: `<h2>Password reset</h2><p>Your code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>`,
  text: `Your verification code is ${code}. It expires in 15 minutes.`,
});
