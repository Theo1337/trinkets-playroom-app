import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { body } = req;

    if (!body.name) {
      return res.status(400).json({ error: "Name not set" });
    }

    const counters = await prisma.counters.create({
      data: body,
    });

    return res.status(200).json(counters);
  } else if (req.method === "GET") {
    const counters = await prisma.counters.findMany({
      orderBy: [
        {
          date: "asc",
        },
      ],
    });

    return res.status(200).json(counters);
  } else {
    return res.status(404);
  }
}
