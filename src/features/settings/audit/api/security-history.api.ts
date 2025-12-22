import { AxiosInstance, isAxiosError } from "axios";
import { AuditLog } from "../types/audit.type";

export async function fetchSecurityHistory(
  axios: AxiosInstance
): Promise<AuditLog[]> {
  try {
    const res = await axios.get("/api/audit/authentication-logs");
    return res.data?.data ?? [];
  } catch (error) {
    if (isAxiosError(error) && error.response) return [];
    throw error; // let react-query handle unexpected errors
  }
}
