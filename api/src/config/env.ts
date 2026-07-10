import "dotenv/config";

const env = {
  PORT: process.env.PORT,
  DATABASE: {
    HOST: process.env.DATABASE_HOST!,
    NAME: process.env.DATABASE_NAME!,
    PORT: process.env.DATABASE_PORT!,
    USER: process.env.DATABASE_USER!,
    PASSWORD: process.env.DATABASE_PASSWORD!
  }
}

export default env