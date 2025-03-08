import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { body } = req;

    if (!body.date) {
      return res.status(400).json({ error: "Date not set" });
    }

    console.log(body);
    const events = await prisma.events.create({
      data: body,
    });

    return res.status(200).json(events);
  } else if (req.method === "GET") {
    const events = await prisma.events.findMany({
      orderBy: [
        {
          createdAt: "asc",
        },
      ],
    });

    return res.status(200).json(events);
  } else {
    return res.status(404);
  }
}
