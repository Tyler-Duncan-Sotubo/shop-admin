/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, Palette, Truck, PackagePlus, X } from "lucide-react";
import Link from "next/link";
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
    payment_setup: CreditCard,
    online_store_customization: Palette,
    shipping_setup: Truck,
    products_added: PackagePlus,
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
      <DrawerContent className="fixed right-2 top-2 h-[calc(100%-16px)] w-[500px] max-w-[95vw] bg-white dark:bg-gray-900 z-50">
        <DrawerHeader className="relative px-4 py-2 border-b">
          <DrawerTitle> Finish setup to start selling</DrawerTitle>
          <p className="text-xs text-muted-foreground">Just a few steps left</p>

          <DrawerClose asChild>
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="h-full p-3 overflow-y-auto">
          <section className="my-5">
            <P className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {completedTasks} of {totalTasks} tasks completed
            </P>
            <Progress value={progressPercentage} className="h-1.5 mt-2" />
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
                      aria-label={completed ? "Not done" : "Done"}
                      title={completed ? "Not done" : "Done"}
                    >
                      {Icon && (
                        <Icon
                          className={`rounded-full p-1 w-5 h-5 ${
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
                      <P className="text-xs text-muted-foreground max-w-[300px] not-first:mt-0">
                        {taskMeta?.description}
                      </P>
                    </div>
                  </div>

                  {completed ? (
                    <span className="text-xs text-green-600 font-medium">
                      ✓ Done
                    </span>
                  ) : (
                    <Link
                      href={taskMeta?.url || "#"}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Set up →
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
