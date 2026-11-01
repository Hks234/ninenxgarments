import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_HOMEPAGE, DEFAULT_SETTINGS } from "../src/lib/settings";

const prisma = new PrismaClient();

async function main() {
  const username = "user-NiNEX243E";
  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("NiNeX@123567894", 12);
    await prisma.adminUser.create({
      data: { username, passwordHash },
    });
    console.log("Created initial administrator account.");
  } else {
    console.log("Administrator already exists; password was not changed.");
  }

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_SETTINGS },
  });

  await prisma.homepageConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, ...DEFAULT_HOMEPAGE, featuredProductIds: [] },
  });

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  for (const [index, label] of sizes.entries()) {
    const slug = label.toLowerCase();
    await prisma.sizeOption.upsert({
      where: { slug },
      update: {},
      create: { label, slug, displayOrder: index },
    });
  }

  const colours = [
    { name: "Black", hex: "#111111" },
    { name: "White", hex: "#f5f5f0" },
    { name: "Navy", hex: "#1b2a4a" },
    { name: "Beige", hex: "#d6c4a8" },
  ];
  for (const [index, colour] of colours.entries()) {
    const slug = colour.name.toLowerCase();
    await prisma.colourOption.upsert({
      where: { slug },
      update: {},
      create: { name: colour.name, slug, hex: colour.hex, displayOrder: index },
    });
  }

  if (process.env.SEED_DEMO === "true") {
    console.log("SEED_DEMO is enabled. Demo catalogue data is optional and skipped by default.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
