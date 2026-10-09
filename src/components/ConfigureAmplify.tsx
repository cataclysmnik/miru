"use client";

import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// For SSR compat in Next.js, though Amplify Gen 2 has specific setup
// We wrap it in a client component that runs once
Amplify.configure(outputs, { ssr: true });

export default function ConfigureAmplify() {
  return null;
}
