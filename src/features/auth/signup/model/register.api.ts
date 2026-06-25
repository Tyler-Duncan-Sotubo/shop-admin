import { axiosInstance } from "@/shared/api/axios";
import { RegisterValues } from "./register.schema";

export const registerApi = {
  async register(values: RegisterValues, slug: string) {
    return axiosInstance.post(
      "/api/companies/register",
      { ...values, slug, role: "owner", country: "Nigeria" },
      { withCredentials: true }
    );
  },
};
