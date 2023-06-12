import axios from "axios";

const baseURL = "https://graph.facebook.com/v13.0"; // Replace with the appropriate API version

export default async function handler(req, res) {
  const { username, password, pageId, message } = req.body;

  // Function to log in to Facebook
  const loginToFacebook = async (username, password) => {
    const response = await axios.get(`${baseURL}/oauth/access_token`, {
      params: {
        grant_type: "password",
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        username,
        password,
      },
    });
    return response.data.access_token;
  };

  // Function to post to a Facebook page
  const postToFacebookPage = async (pageId, message) => {
    const response = await axios.post(
      `${baseURL}/${pageId}/feed`,
      {
        message,
      },
      {
        params: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
        },
      }
    );

    return response.data;
  };

  try {
    const accessToken = await loginToFacebook(username, password);
    const result = await postToFacebookPage(pageId, message);

    console.log("Post created successfully!", result);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to create post", error);
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
}
