/** Maps Supabase auth errors to user-friendly messages. */
export function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Wrong email or password. Please try again.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please verify your email first — check your inbox (and spam folder) for the confirmation link.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (lower.includes("signup is disabled")) {
    return "Sign-ups are temporarily disabled. Please try again later.";
  }

  return message;
}
