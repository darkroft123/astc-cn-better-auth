import { env } from "@/config/env";

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: {
      id: string;
      code: string;
      name: string;
    };
  };
}

export async function loginApi(
  input: LoginInput
): Promise<LoginResponse> {

  console.log("================================");
  console.log("🚀 AUTH API LOGIN START");
  console.log("🌍 AUTH URL:", env.AUTH_API_URL);
  console.log("📤 PAYLOAD:", input);

  const url = `${env.AUTH_API_URL}/login`;

  console.log("🔗 FULL URL:", url);

  try {

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    console.log("📥 RESPONSE STATUS:", response.status);
    console.log("📥 RESPONSE OK:", response.ok);

    const data = await response.json();

    console.log("📦 RESPONSE DATA:", data);

    if (!response.ok) {
      console.error("❌ LOGIN FAILED");
      console.error(data);

      throw new Error(
        data.message || "Error de inicio de sesión"
      );
    }

    console.log("✅ LOGIN SUCCESS");
    console.log("🔐 TOKEN:", data.token);

    return data;

  } catch (err) {

    console.error("🔥 FETCH ERROR");
    console.error(err);

    throw err;
  }
}