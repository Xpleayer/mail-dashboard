declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    AUTH_USERNAME: string;
    AUTH_PASSWORD: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    SMTP_HOST: string;
    SMTP_PORT: string;
    SMTP_USER: string;
    SMTP_PASS: string;
    SMTP_FROM: string;
    N8N_SECRET: string;
    N8N_API_URL: string;
    N8N_API_KEY: string;
  }
}
