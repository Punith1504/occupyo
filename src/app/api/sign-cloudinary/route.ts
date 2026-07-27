import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paramsToSign } = body;

    // Security Hardening: Enforce explicit format and size limits on signatures
    // Clients must request specific safe formats and size limits or be rejected.
    // Ensure the client requested 'allowed_formats'
    if (!paramsToSign.allowed_formats) {
      // Forcefully inject safe defaults into the signature to prevent bypasses
      // Note: If the client does not send this parameter, the signature will fail on upload.
      // We will reject the request if it doesn't include it.
      return NextResponse.json({ error: "Upload signature requires allowed_formats" }, { status: 400 });
    }

    const safeFormats = ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'mp4', 'mov', 'heic'];
    const requestedFormats = (paramsToSign.allowed_formats || '').split(',');
    
    for (const format of requestedFormats) {
      if (!safeFormats.includes(format.trim().toLowerCase())) {
        return NextResponse.json({ error: `Format ${format} is strictly prohibited` }, { status: 403 });
      }
    }

    if (!paramsToSign.max_file_size || parseInt(paramsToSign.max_file_size, 10) > 15000000) {
      return NextResponse.json({ error: "File size exceeds 15MB maximum or max_file_size is missing" }, { status: 400 });
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Cloudinary Signature Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
