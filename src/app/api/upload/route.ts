import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general"; // "materials" or "submissions"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const safeCategory = category.replace(/[^a-zA-Z0-9_-]/g, "");
    const uploadDir = path.join(process.cwd(), "public", "uploads", safeCategory);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Sanitize and create unique filename
    const originalName = file.name || "upload";
    const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const timestamp = Date.now();
    const finalFileName = `${timestamp}_${sanitizedOriginalName}`;
    const filePath = path.join(uploadDir, finalFileName);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${safeCategory}/${finalFileName}`;

    // Format human-friendly file size
    const bytes = buffer.length;
    let formattedSize = `${bytes} B`;
    if (bytes >= 1024 * 1024) {
      formattedSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      formattedSize = `${Math.round(bytes / 1024)} KB`;
    }

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: originalName,
      fileSize: formattedSize,
      fileType: file.type || "application/octet-stream",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
