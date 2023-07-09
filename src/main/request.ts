import axios from "axios";

export async function sendPost(endpoint: string, data: any): Promise<any> {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8080/${endpoint}`,
      data
    );
    const responseData = response.data;
    return responseData;
  } catch (error) {
    console.error("Error:", error);
    process.exit(0);
  }
}
