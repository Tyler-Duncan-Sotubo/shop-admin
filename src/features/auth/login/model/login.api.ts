export type CustomLoginPayload = {
  email: string;
  password: string;
};

export const loginApi = {
  async customLogin(payload: CustomLoginPayload) {
    const response = await fetch("/api/custom-login", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },
};
