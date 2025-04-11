"use server";

import { api } from "@/utils"; // Import the API utility

export async function getEntriesForUser(userId) {
  // Fetch entries for a specific user from the API
  const response = await api.get(`/journals?userId=${userId}`);
  console.log(response.data);
  return response.data; // Assuming the API returns the data in the `data` field
}

export async function getEntryByDate(userId, date) {
  // Fetch a specific entry by userId and date from the API
  const response = await api.get(`/journals?userId=${userId}&date=${date}`);
  return response.data.length > 0 ? response.data[0] : null; // Assuming the API returns an array
}

export async function saveJournalEntry(entry) {
  console.log(entry);
  if (entry.id) {
    // Update an existing entry
    const response = await api.put(`/journals/${entry.id}`, {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      isPasswordProtected: entry.isPasswordProtected,
      password: entry.password,
      date: entry.date,
      userId: JSON.stringify(entry.userId),
    });
    return response.data; // Assuming the API returns the updated entry
  } else {
    // Create a new entry
    const response = await api.post(`/journals`, {
      userId: JSON.stringify(entry.userId),
      title: entry.title,
      content: entry.content,
      isPasswordProtected: entry.isPasswordProtected,
      password: entry.password,
      date: entry.date,
    });
    return response.data; // Assuming the API returns the created entry
  }
}

export async function deleteEntry(entry) {
  // Delete an entry by its ID
  const response = await api.delete(`/journals/${entry.id}`);
  return response.status === 200; // Assuming a 200 status means success
}
