import { prisma } from "@/lib/database";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const id = Number(req.query.id);

    await prisma.journals.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ success: true, id: id });
  } else if (req.method === "PUT") {
    const { body } = req;

    if (!body.id) {
      return res.status(400).json({ error: "ID not set" });
    }

    const journals = await prisma.journals.update({
      where: {
        id: body.id,
      },
      data: body,
    });

    return res.status(200).json(journals);
  } else {
    return res.status(404);
  }
}
