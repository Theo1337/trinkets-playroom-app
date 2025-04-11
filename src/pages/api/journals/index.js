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
    const { userId, date } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch by userId and optionally by date
    const journals = await prisma.journals.findMany({
      where: {
        userId: userId,
        ...(date && { date: date }), // Include date conditionally if provided
      },
    });

    return res.status(200).json(journals);
  } else {
    return res.status(404).json({ error: "Method not allowed" });
  }
}
