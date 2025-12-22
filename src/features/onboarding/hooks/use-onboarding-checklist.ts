import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { axiosInstance } from "@/shared/api/axios";
import {
  OnboardingChecklist,
  OnboardingTaskKey,
} from "../types/onboarding.types";

export function useOnboardingChecklist() {
  const { data: session } = useSession();

  const fetchOnboarding = async (
    token: string
  ): Promise<OnboardingChecklist> => {
    const res = await axiosInstance("/api/company-settings/onboarding", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Expecting:
    // {
    //   "store_setup": false,
    //   "location_setup": false,
    //   "payment_setup": false
    // }
    return res.data.data as OnboardingChecklist;
  };

  const {
    data: onboarding,
    isLoading,
    isError,
  } = useQuery<OnboardingChecklist>({
    queryKey: ["onboarding"],
    queryFn: () =>
      fetchOnboarding(session?.backendTokens.accessToken as string),
    enabled: !!session?.backendTokens?.accessToken,
  });

  const { totalTasks, completedTasks, progressPercentage, allCompleted } =
    useMemo(() => {
      if (!onboarding) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          progressPercentage: 0,
          allCompleted: false,
        };
      }

      const entries = Object.entries(onboarding) as [
        OnboardingTaskKey,
        boolean
      ][];

      const total = entries.length;
      const completed = entries.filter(([, done]) => done).length;
      const progress = total > 0 ? (completed / total) * 100 : 0;
      const allDone = total > 0 && completed === total;

      return {
        totalTasks: total,
        completedTasks: completed,
        progressPercentage: progress,
        allCompleted: allDone,
      };
    }, [onboarding]);

  return {
    onboarding,
    isLoading,
    isError,
    totalTasks,
    completedTasks,
    progressPercentage,
    allCompleted,
  };
}
