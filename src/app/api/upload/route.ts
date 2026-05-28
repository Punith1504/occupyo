import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const files = data.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize filename and ensure uniqueness
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const uniqueFilename = `${uuidv4()}-${sanitizedName}`;
      
      const uploadDir = join(process.cwd(), "public", "uploads");
      const filePath = join(uploadDir, uniqueFilename);

      await writeFile(filePath, buffer);
      
      uploadedUrls.push(`/uploads/${uniqueFilename}`);
    }

    return NextResponse.json({ success: true, urls: uploadedUrls });
  } catch (error) {
    console.error("Error saving file locally:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
