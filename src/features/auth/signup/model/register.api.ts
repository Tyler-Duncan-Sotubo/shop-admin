import { axiosInstance } from "@/shared/api/axios";
import { RegisterValues } from "./register.schema";

export const registerApi = {
  async register(values: RegisterValues, slug: string) {
    const res = await axiosInstance.post(
      "/api/companies/register",
      { ...values, slug, role: "owner", country: "Nigeria" },
      { withCredentials: true }
    );
    return res.data;
  },
};
