import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const id = Number(req.query.id);

    await prisma.counters.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ success: true, id: id });
  } else if (req.method === "PUT") {
    const { body } = req;

    if (!body.name) {
      return res.status(400).json({ error: "Name not set" });
    }

    const counters = await prisma.counters.update({
      where: {
        id: body.id,
      },
      data: body,
    });

    return res.status(200).json(counters);
  } else {
    return res.status(404);
  }
}
