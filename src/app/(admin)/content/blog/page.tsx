import { BlogPostClient } from "@/features/content/blog/ui/blog-posts-client";
import { PlanGate } from "@/features/subscription/ui/plan-gate";
import React from "react";

const page = () => {
  return (
    <PlanGate feature="blogPosts">
      <BlogPostClient />
    </PlanGate>
  );
};

export default page;
