import { AxiosInstance, isAxiosError } from "axios";
import type { z } from "zod";
import { ProfileSchema } from "../schema/profile.schema";
import { User } from "../types/profile.type";

export type ProfileValues = z.infer<typeof ProfileSchema>;

export async function fetchUserProfile(axios: AxiosInstance): Promise<User> {
  const res = await axios.get("/api/auth/profile");
  return res.data?.data;
}

export async function updateUserProfile(
  axios: AxiosInstance,
  values: ProfileValues
) {
  try {
    const res = await axios.patch("/api/auth/profile", values);
    return res.data?.data;
  } catch (error) {
    // keep behaviour consistent with your codebase
    if (isAxiosError(error) && error.response) throw error;
    throw error;
  }
}
