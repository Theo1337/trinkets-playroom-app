export default async function handler(req, res) {
  if (req.method === "GET") {
    const body = {
      name: req.query.name,
      year: req.query.year,
      type: req.query.type,
    };

    if (!body.name) {
      return res.status(200).json({ error: "Name not set", movies: [] });
    }

    const movies = fetch(
      `https://api.themoviedb.org/3/search/${body.type}?query=${body.name}&primary_release_year=${body.year}&language=pt-BR`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        return res.results;
      });

    return res.status(200).json(await movies);
  }
}
