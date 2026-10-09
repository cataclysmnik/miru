import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "miru_users_db.json");

interface StoredProfile {
  email: string;
  name: string;
  role: "STUDENT" | "TEACHER";
  idNumber: string;
}

function readRegistry(): Record<string, StoredProfile> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading miru_users_db.json:", err);
  }
  return {};
}

function writeRegistry(data: Record<string, StoredProfile>) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing miru_users_db.json:", err);
  }
}

export async function GET() {
  const registry = readRegistry();
  return NextResponse.json({ success: true, registry });
}

export async function POST(req: Request) {
  try {
    const profile: StoredProfile = await req.json();
    if (!profile.idNumber || !profile.email) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const registry = readRegistry();
    // Index by ID and by Email
    registry[profile.idNumber.toUpperCase()] = profile;
    registry[profile.idNumber.toLowerCase()] = profile;
    registry[profile.email.toLowerCase()] = profile;

    writeRegistry(registry);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
