"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { resizeImageFile } from "@/lib/resize-image";

interface MultiImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  label?: string;
}

export default function MultiImageUpload({
  value,
  onChange,
  label = "Images",
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      setError("Please choose image files.");
      return;
    }

    setError("");
    setProcessing(true);
    try {
      const dataUrls = await Promise.all(imageFiles.map(resizeImageFile));
      onChange([...value, ...dataUrls]);
    } catch {
      setError("Could not process one of those images.");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>

      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {value.map((src, i) => (
            <div
              key={i}
              className="relative h-20 w-20 overflow-hidden rounded-lg border"
            >
              <Image
                src={src}
                alt={`Image ${i + 1}`}
                fill
                unoptimized={src.startsWith("data:")}
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={processing}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
      >
        {processing ? "Processing..." : "Add Images"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}