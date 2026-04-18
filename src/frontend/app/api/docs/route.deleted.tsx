// This file should be deleted
import { NextResponse } from "next/server";
import swaggerJson from "../../../swagger.json";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(swaggerJson);
}

export async function HEAD() {
  return NextResponse.json(swaggerJson);
}