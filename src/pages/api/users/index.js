export default async function handler(req, res) {
  if (req.method === "GET") {
    const TOKEN = process.env.DISCORD_BOT_TOKEN;
    const usersIds = ["1250558369937363107", "277539638397370369"];

    async function getUsername(userId) {
      const url = `https://discord.com/api/v9/users/${userId}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bot ${TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching user data: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        name: data.username,
        avatar: data.avatar,
        id: userId,
      };
    }

    let users = [];

    for (const userId of usersIds) {
      const user = await getUsername(userId);
      users.push(user);
    }

    return res.status(200).json(users);
  } else {
    return res.status(404);
  }
}
