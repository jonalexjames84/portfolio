import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/ResumePDF";
import { NextResponse } from "next/server";

export async function GET() {
  const buffer = await renderToBuffer(<ResumePDF />);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Jon-Martin-Resume.pdf"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
