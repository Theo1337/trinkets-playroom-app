export default async function handler(req, res) {
  if (req.method === "GET") {
    const body = {
      id: req.query.id,
    };

    if (!body.id) {
      return res.status(200).json({ error: "Id not set", providers: [] });
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${body.id}/watch/providers`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          },
        }
      );

      const result = await response.json();
      const data = result.results?.BR?.flatrate || [];
      const myProviders = [
        "Globoplay",
        "Netflix",
        "Amazon Prime Video",
        "Disney Plus",
      ];

      const filteredProviders = data.filter((each) =>
        myProviders.includes(each.provider_name)
      );

      return res.status(200).json({ providers: filteredProviders });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch providers" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
