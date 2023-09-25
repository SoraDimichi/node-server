declare namespace NodeJS {
  type ProcessEnv = {
    ENV: "development" | "production";
    API_PORT: string;
    STAT_PORT: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
  };
}
