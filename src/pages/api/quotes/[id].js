import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const id = Number(req.query.id);

    await prisma.quotes.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ success: true, id: id });
  } else if (req.method === "PUT") {
    const { body } = req;

    if (!body.quote) {
      return res.status(400).json({ error: "Quote not set" });
    }

    const quotes = await prisma.quotes.update({
      where: {
        id: body.id,
      },
      data: body,
    });

    return res.status(200).json(quotes);
  } else {
    return res.status(404);
  }
}
