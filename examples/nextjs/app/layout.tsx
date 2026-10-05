import type { ReactNode } from "react";
import "../../../src/react/styles.css";
import "./styles.css";
export const metadata = { title: "Image pipeline example", description: "A local reference for image uploads." };
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
