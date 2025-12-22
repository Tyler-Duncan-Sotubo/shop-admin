"use client";

import { EditProduct } from "./edit-product";
import { ProductVariants } from "./product-variants";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"; // adjust path if needed

const EditProductClient = ({ productId }: { productId: string }) => {
  return (
    <Tabs defaultValue="attributes" className="space-y-6">
      <TabsList>
        <TabsTrigger value="attributes">Edit Product</TabsTrigger>
        <TabsTrigger value="variations">Attributes & Variations</TabsTrigger>
      </TabsList>

      <TabsContent value="attributes" className="space-y-6">
        <EditProduct productId={productId} />
      </TabsContent>

      <TabsContent value="variations" className="space-y-6">
        <ProductVariants productId={productId} />
      </TabsContent>
    </Tabs>
  );
};

export default EditProductClient;
