import { prisma } from './src/lib/prisma';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Success! DB is working. Result:", user);
  } catch (e) {
    console.error("DB Connection/Query Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
