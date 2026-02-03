import { useState } from "react";
import { toast } from "sonner";
import useAxiosAuth from "../hooks/use-axios-auth";

export function useDownloadFile(token?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const axiosInstance = useAxiosAuth();

  const download = async (endpoint: string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fileUrl = res.data?.data?.url?.url ?? res.data?.data?.url ?? null;

      if (fileUrl) {
        window.open(fileUrl, "_blank");
      } else {
        toast.error("No file URL found.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return { download, isLoading };
}
