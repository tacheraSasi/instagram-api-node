import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;
const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

// Middleware to parse JSON
app.use(express.json());

// Function to fetch the hashtag ID
async function getHashtagId(hashtag) {
  const url = `https://graph.facebook.com/v17.0/ig_hashtag_search?user_id={user_id}&q=${hashtag}&access_token=${accessToken}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0].id; // Return the first matching hashtag ID
    } else {
      return null; // No hashtag found
    }
  } catch (error) {
    console.error("Error fetching hashtag ID:", error);
    return null;
  }
}

// Function to fetch Instagram posts with the hashtag ID
async function fetchInstagramPosts(hashtagId) {
  const url = `https://graph.facebook.com/v17.0/${hashtagId}/recent_media?user_id={user_id}&fields=id,caption,media_url,permalink&access_token=${accessToken}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.data; // Return posts data
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    return [];
  }
}

// Route to search posts based on hashtag input
app.get("/search", async (req, res) => {
  const { hashtag } = req.query;
  
  if (!hashtag) {
    return res.status(400).json({ error: "Hashtag is required" });
  }
  
  // Get the hashtag ID
  const hashtagId = await getHashtagId(hashtag);
  
  if (!hashtagId) {
    return res.status(404).json({ error: "Hashtag not found" });
  }

  // Fetch Instagram posts with the hashtag
  const posts = await fetchInstagramPosts(hashtagId);
  
  // Return the posts
  res.json(posts);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
