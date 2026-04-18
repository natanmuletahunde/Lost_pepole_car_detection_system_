import { NextResponse } from "next/server";
import swaggerJson from "../../../swagger.json";

export const dynamic = "force-dynamic";

export const GET = () => NextResponse.json(swaggerJson);