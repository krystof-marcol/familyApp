import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: "File and userId are required" },
        { status: 400 },
      );
    }

    const { data: existingFiles, error: listError } = await supabase.storage
      .from("user-images")
      .list("avatars", {
        search: userId,
      });

    if (listError) {
      console.error("Error listing files:", listError);
    }

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles
        .filter((file) => file.name.startsWith(`${userId}-`))
        .map((file) => `avatars/${file.name}`);

      if (filesToDelete.length > 0) {
        console.log("Deleting old files:", filesToDelete);
        const { error: deleteError } = await supabase.storage
          .from("user-images")
          .remove(filesToDelete);

        if (deleteError) {
          console.error("Error deleting old files:", deleteError);
        }
      }
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("user-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("user-images").getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
