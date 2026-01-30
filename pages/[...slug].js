// pages/[...slug].js
export { default, getStaticProps } from "./index";

export async function getStaticPaths() {
  const routes = [
    "highlights",
    "models",
    // "research",  // <-- remove this
    "performance",
    "about",
    "contact",
  ];

  return {
    paths: routes.map((r) => ({ params: { slug: [r] } })),
    fallback: false,
  };
}
