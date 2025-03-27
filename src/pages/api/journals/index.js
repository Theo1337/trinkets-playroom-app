import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { body } = req;

    if (!body.date) {
      return res.status(400).json({ error: "Date not set" });
    }

    const journals = await prisma.journals.create({
      data: body,
    });

    return res.status(200).json(journals);
  } else if (req.method === "GET") {
    const journals = await prisma.journals.findMany({
      orderBy: [
        {
          createdAt: "asc",
        },
      ],
    });

    return res.status(200).json(journals);
  } else {
    return res.status(404);
  }
}
