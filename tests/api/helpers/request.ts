import request from "supertest";

const host = "http://127.0.0.1:49213";

export async function makeRequest(endpoint: string, payload: any) {
  const response = await request(host).post(endpoint).send(payload);
  return response.body;
}
