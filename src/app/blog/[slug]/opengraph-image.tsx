import { ImageResponse } from "next/og";
import { getPost, posts } from "@/lib/posts";

export const alt = "Blog Post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            background: "#09090b",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fafafa",
            fontSize: 48,
          }}
        >
          Not Found
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #09090b 0%, #18181b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            {post.tags.slice(0, 3).map((tag) => (
              <div
                key={tag}
                style={{
                  fontSize: 16,
                  color: "#a1a1aa",
                  border: "1px solid #3f3f46",
                  borderRadius: "9999px",
                  padding: "4px 16px",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.2,
              maxWidth: "1000px",
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              lineHeight: 1.4,
              maxWidth: "900px",
            }}
          >
            {post.subtitle}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 20,
            color: "#52525b",
          }}
        >
          <span>Jonny Martin</span>
          <span>·</span>
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
