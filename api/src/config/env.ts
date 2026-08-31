import "dotenv/config";

const env = {
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY!,
  MIDTRANS: {
    SERVER_KEY: process.env.MIDTRANS_SERVER_KEY!,
    CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY!,
  },
  PORT: process.env.PORT,
  DATABASE: {
    HOST: process.env.DATABASE_HOST!,
    NAME: process.env.DATABASE_NAME!,
    PORT: process.env.DATABASE_PORT!,
    USER: process.env.DATABASE_USER!,
    PASSWORD: process.env.DATABASE_PASSWORD!,
  },
};

export default env;
