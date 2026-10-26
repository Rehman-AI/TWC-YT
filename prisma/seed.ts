import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Boss account
  const hashedPassword = await hash("password", 12);

  const boss = await prisma.user.upsert({
    where: { email: "boss@twc.com" },
    update: {
      name: "Sami",
    },
    create: {
      name: "Sami",
      email: "boss@twc.com",
      password: hashedPassword,
      isBoss: true,
    },
  });

  console.log("Boss account created:", boss.email);
  console.log("Login: boss@twc.com / password");
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
