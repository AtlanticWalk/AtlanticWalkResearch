// pages/[...slug].js

export { default, getStaticProps } from "./index";

// Because this is a dynamic SSG page (it uses getStaticProps),
// Next requires getStaticPaths to prebuild the allowed routes.
export async function getStaticPaths() {
  const routes = [
    "highlights",
    "models",
    "research",
    "performance",
    "about",
    "contact",
  ];

  return {
    paths: routes.map((r) => ({ params: { slug: [r] } })),
    fallback: false, // anything else => 404 (keeps behavior clean)
  };
}
