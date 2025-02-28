import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { body } = req;

    if (!body.quote) {
      return res.status(400).json({ error: "Quote not set" });
    }

    const quotes = await prisma.quotes.create({
      data: body,
    });

    return res.status(200).json(quotes);
  } else if (req.method === "GET") {
    const startOfDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );
    const endOfDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 1
    );

    const quotes = await prisma.quotes.findMany({
      where: {
        AND: [
          {
            date: {
              gte: startOfDay, // Convert to timestamp (milliseconds)
            },
          },
          {
            date: {
              lt: endOfDay, // Convert to timestamp (milliseconds)
            },
          },
        ],
      },
      orderBy: [
        {
          date: "asc",
        },
      ],
    });

    return res.status(200).json(quotes);
  } else {
    return res.status(404);
  }
}
