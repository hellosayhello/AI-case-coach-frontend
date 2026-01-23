import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const EMAILS_FILE = path.join(process.cwd(), "subscribers.json");

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    let emails: string[] = [];
    try {
      const data = await fs.readFile(EMAILS_FILE, "utf-8");
      emails = JSON.parse(data);
    } catch {
      emails = [];
    }

    if (!emails.includes(email)) {
      emails.push(email);
      await fs.writeFile(EMAILS_FILE, JSON.stringify(emails, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}