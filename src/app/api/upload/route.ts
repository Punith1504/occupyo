import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create a unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadDir, filename);

      await fs.writeFile(filePath, buffer);
      
      // The public URL path (served statically by Next.js)
      uploadedUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
