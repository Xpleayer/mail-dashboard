export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/((?!login|api/auth|api/n8n|_next/static|_next/image|favicon.ico).*)",
  ],
};
