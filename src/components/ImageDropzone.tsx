import { useCallback, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageDropzoneProps {
  value?: string;
  onChange: (url: string | null) => void;
  bucket: string;
  folder?: string;
  className?: string;
  accept?: string;
}

export function ImageDropzone({
  value,
  onChange,
  bucket,
  folder = "",
  className,
  accept = "image/*",
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setIsUploading(true);

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        onChange(data.publicUrl);
        toast.success("Image uploaded!");
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [bucket, folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleRemove = useCallback(async () => {
    if (!value) return;

    try {
      // Extract file path from URL
      const url = new URL(value);
      const pathParts = url.pathname.split(`/${bucket}/`);
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from(bucket).remove([filePath]);
      }
    } catch {
      // Ignore removal errors
    }

    onChange(null);
  }, [value, bucket, onChange]);

  return (
    <div className={cn("space-y-3", className)}>
      {value ? (
        <div className="relative group">
          <div className="aspect-square w-32 rounded-xl overflow-hidden border-2 border-primary bg-background-elevated">
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-border hover:border-primary/50 hover:bg-card",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileSelect}
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-foreground-muted">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {isDragging ? (
                  <ImageIcon className="w-6 h-6 text-primary" />
                ) : (
                  <Upload className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-foreground">
                  {isDragging ? "Drop image here" : "Drag & drop"}
                </span>
                <p className="text-xs text-foreground-muted mt-1">
                  or click to browse
                </p>
              </div>
            </div>
          )}
        </label>
      )}
    </div>
  );
}
