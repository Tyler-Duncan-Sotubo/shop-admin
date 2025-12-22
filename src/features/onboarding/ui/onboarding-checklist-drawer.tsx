/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { X, Store, MapPin, BadgeDollarSign, Palette } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/shared/ui/drawer";
import Loading from "@/shared/ui/loading";
import { useOnboardingChecklist } from "../hooks/use-onboarding-checklist";
import { OnboardingTaskKey } from "../types/onboarding.types";
import { onboardingTaskLabels } from "../config/onboarding-tasks";
import { P } from "@/shared/ui/typography";

const OnboardingChecklistDrawer = () => {
  const {
    onboarding,
    isLoading,
    isError,
    totalTasks,
    completedTasks,
    progressPercentage,
    allCompleted,
  } = useOnboardingChecklist();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);

  useEffect(() => {
    if (isLoading || isError) return;

    if (allCompleted) {
      setIsModalOpen(false);
      return;
    }

    if (!userDismissed) {
      setIsModalOpen(true);
    }
  }, [allCompleted, isLoading, isError, userDismissed]);

  if (isLoading) return <Loading />;
  if (isError) return null; // or show something inline on the page

  if (!onboarding) return null;

  const entries = Object.entries(onboarding) as [OnboardingTaskKey, boolean][];

  if (entries.length === 0 || allCompleted) return null;

  const taskIcons: Record<OnboardingTaskKey, React.ComponentType<any>> = {
    store_setup: Store,
    location_setup: MapPin,
    payment_setup: BadgeDollarSign,
    branding_setup: Palette, // 👈 new branding icon
  };

  const handleClose = () => {
    setUserDismissed(true);
    setIsModalOpen(false);
  };

  return (
    <Drawer
      open={isModalOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        } else {
          setIsModalOpen(true);
        }
      }}
    >
      <DrawerContent className="fixed left-2 top-0 w-[40%] bg-white shadow-lg border-r dark:bg-gray-900 z-50">
        <DrawerHeader className="relative px-4 py-4 border-b">
          <DrawerTitle>Let’s get your store ready</DrawerTitle>

          <DrawerClose asChild>
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="h-[calc(100%-56px)] p-4 overflow-y-auto">
          <section className="my-5">
            <P className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {completedTasks} of {totalTasks} tasks completed
            </P>
            <Progress value={progressPercentage} className="h-2 mt-2" />
          </section>

          <ul className="space-y-3 border p-3 rounded-lg">
            {entries.map(([taskKey, completed]) => {
              const taskMeta = onboardingTaskLabels[taskKey];
              const Icon = taskIcons[taskKey];

              return (
                <li
                  key={taskKey}
                  className="flex items-center justify-between px-3 py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={[
                        "inline-flex w-8 h-8 items-center justify-center rounded-full border",
                        completed
                          ? "bg-green-50 border-green-600 text-green-700"
                          : "bg-muted border-border text-foreground/60",
                      ].join(" ")}
                      aria-label={completed ? "Completed" : "Pending"}
                      title={completed ? "Completed" : "Pending"}
                    >
                      {Icon && (
                        <Icon
                          className={`rounded-full p-1 w-7 h-7 ${
                            completed
                              ? "bg-green-500 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <P className="font-bold">{taskMeta?.label ?? taskKey}</P>
                      <P className="text-sm text-muted-foreground max-w-[300px] not-first:mt-0">
                        {taskMeta?.description}
                      </P>
                    </div>
                  </div>

                  {completed ? (
                    <Badge variant="completed">Completed</Badge>
                  ) : (
                    <Link href={taskMeta?.url || "#"}>
                      <Badge variant="pending">Complete now</Badge>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default OnboardingChecklistDrawer;
