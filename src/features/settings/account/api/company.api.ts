import { AxiosInstance } from "axios";
import {
  CompanyAccount,
  UpdateCompanyAccountPayload,
} from "../types/company-account.type";

const COMPANY_API_URL = "/api/companies";

export async function fetchCompany(
  axiosAuth: AxiosInstance
): Promise<CompanyAccount> {
  const res = await axiosAuth.get(COMPANY_API_URL);
  return res.data as CompanyAccount;
}

export async function updateCompanyDetails(
  axiosAuth: AxiosInstance,
  body: UpdateCompanyAccountPayload,
  accessToken?: string
): Promise<CompanyAccount> {
  const res = await axiosAuth.patch(COMPANY_API_URL, body, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });

  return res.data as CompanyAccount;
}
