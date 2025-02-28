export default async function handler(req, res) {
  if (req.method === "GET") {
    const body = {
      name: req.query.name,
      year: req.query.year,
    };

    if (!body.name) {
      return res.status(400).json({ error: "Name not set" });
    }

    const movies = fetch(
      `http://omdbapi.com/?apikey=${
        process.env.REACT_APP_MOVIE_API_KEY
      }&t=${body.name.replace(" ", "+")}${body.year && `&y=${body.year}`}`
    )
      .then((res) => res.json())
      .then((res) => {
        return res;
      });

    return res.status(200).json(await movies);
  }
}
