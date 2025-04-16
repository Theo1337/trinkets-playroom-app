"use server";

import { api } from "@/utils"; // Import the API utility

export async function getEntriesForUser(userId) {
  console.log(userId);
  // Fetch entries for a specific user from the API
  const response = await api.get(`/journals?userId=${userId}`);
  return response.data; // Assuming the API returns the data in the `data` field
}

export async function getEntryByDate(userId, date) {
  // Fetch a specific entry by userId and date from the API
  const response = await api.get(`/journals?userId=${userId}&date=${date}`);
  return response.data.length > 0 ? response.data[0] : null; // Assuming the API returns an array
}

export async function saveJournalEntry(entry) {
  const users = await api.get("/users");
  if (entry.id) {
    // Update an existing entry
    await api
      .put(`/journals/${entry.id}`, {
        id: entry.id,
        title: entry.title,
        content: entry.content,
        isPasswordProtected: entry.isPasswordProtected,
        password: entry.password,
        date: entry.date,
        userId: entry.userId,
      })
      .then((res) => {
        api.post("/notifications", {
          body: `Página editada no diário de ${
            users.data.find((user) => user.id === entry.userId).name
          }!`,
          url: "/journal",
          userId: entry.userId,
        });
        return res.data; // Assuming the API returns the updated entry
      });
  } else {
    // Create a new entry
    await api
      .post(`/journals`, {
        userId: entry.userId,
        title: entry.title,
        content: entry.content,
        isPasswordProtected: entry.isPasswordProtected,
        password: entry.password,
        date: entry.date,
      })
      .then((res) => {
        api.post("/notifications", {
          body: `Nova página adicionada ao diário de ${
            users.data.find((user) => user.id === entry.userId).name
          }!`,
          url: "/journal",
          userId: entry.userId,
        });
        return res.data; // Assuming the API returns the created entry
      });
  }
}

export async function deleteEntry(entry) {
  // Delete an entry by its ID
  const response = await api.delete(`/journals/${entry.id}`);
  return response.status === 200; // Assuming a 200 status means success
}
