"use client";

import { useMemo } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import swaggerJson from "../../../swagger.json";

export default function SwaggerDocsPage() {
  const spec = useMemo(() => swaggerJson as Record<string, unknown>, []);

  return (
    <div style={{ padding: "0" }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}