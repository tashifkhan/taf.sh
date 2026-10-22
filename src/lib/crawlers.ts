import { canonicalPath } from "./seo";

// Directory-style alternatives match the HTML routes, including the homepage.
export const markdownPath = (path: string) => `${canonicalPath(path)}index.md`;
