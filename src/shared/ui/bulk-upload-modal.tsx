"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "@/shared/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import FormError from "@/shared/ui/form-error";
import { Card } from "@/shared/ui/card";
import { Download, Trash, UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useCreateMutation } from "../hooks/use-create-mutation";

const csvSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length > 0, { message: "A file is required." })
    .refine(
      (files) => {
        const fileName = files?.[0]?.name.toLowerCase();
        return fileName?.endsWith(".csv") || fileName?.endsWith(".xlsx");
      },
      { message: "Only CSV and XLSX files are allowed." }
    ),
});

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  refetchKey: string;
  successMessage: string;
  exampleDownloadHref: string;
  exampleDownloadLabel: string;
}

const BulkUploadModal = ({
  isOpen,
  onClose,
  title,
  endpoint,
  refetchKey,
  successMessage,
  exampleDownloadHref,
  exampleDownloadLabel,
}: BulkUploadModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const uploadMutation = useCreateMutation({
    endpoint,
    successMessage,
    refetchKey,
  });

  const form = useForm<z.infer<typeof csvSchema>>({
    resolver: zodResolver(csvSchema),
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFileName(acceptedFiles[0].name);
        form.setValue("file", acceptedFiles as unknown as FileList);
      }
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const onSubmit = async (values: z.infer<typeof csvSchema>) => {
    setError(null);
    const formdata = new FormData();
    formdata.append("file", values.file[0]);
    await uploadMutation(formdata, setError, form.reset, onClose);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      confirmText="Upload"
      onConfirm={form.handleSubmit(onSubmit)}
      isLoading={form.formState.isSubmitting}
    >
      <Card className="max-w-2xl mx-auto p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="file"
              control={form.control}
              render={() => (
                <FormItem>
                  <FormLabel>{!fileName && "Select CSV File"}</FormLabel>
                  <FormControl>
                    {fileName ? (
                      <div className="gap-2 border-2 border-dashed border-gray-400 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                        <Image
                          src="/templates/sheet.png"
                          alt="CSV Icon"
                          width={40}
                          height={40}
                        />
                        <p className="text-green-600 text-lg">{fileName}</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="text-error"
                          onClick={() => {
                            setFileName(null);
                            form.setValue("file", null);
                          }}
                        >
                          <Trash size={16} /> Remove
                        </Button>
                      </div>
                    ) : (
                      <div
                        {...getRootProps()}
                        className="border-2 border-dashed border-gray-400 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all"
                      >
                        <input {...getInputProps()} />
                        <UploadCloud size={50} className="text-gray-600 mb-2" />
                        <p className="text-gray-700">
                          {isDragActive
                            ? "Drop the file here..."
                            : "Drag & drop or click to select"}
                        </p>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Card>

      <div className="flex justify-between mt-4">
        <Link href={exampleDownloadHref} download>
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" /> Download Example
            {exampleDownloadLabel}
          </Button>
        </Link>
      </div>

      <p className="text-sm text-gray-500 mt-2 w-2/3">
        Please ensure your file is formatted correctly. You can download a
        sample above.
      </p>

      {error && <FormError message={error} />}
    </Modal>
  );
};

export default BulkUploadModal;
