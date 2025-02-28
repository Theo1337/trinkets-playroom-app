import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { body } = req;

    if (!body.name) {
      return res.status(400).json({ error: "Name not set" });
    }

    const movies = await prisma.movies.create({
      data: body,
    });

    return res.status(200).json(movies);
  } else if (req.method === "GET") {
    const movies = await prisma.movies.findMany({
      orderBy: [
        {
          created_at: "asc",
        },
      ],
    });

    return res.status(200).json(movies);
  } else {
    return res.status(404);
  }
}
