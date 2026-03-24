const { PrismaClient } = require('../lib/generated/prisma-runtime-v3')

async function main() {
  const prisma = new PrismaClient()
  try {
    const routines = await prisma.routine.findMany({
      include: {
        regimens: {
          include: {
            tasks: true,
          },
        },
      },
    })
    console.log(JSON.stringify(routines, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
