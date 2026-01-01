export function pageLabelFromPath(path: string) {
  if (path === "/") return "Homepage";
  if (path.startsWith("/products")) return "Product";
  if (path.startsWith("/collections")) return "Collection";
  if (path.startsWith("/blog")) return "Blog";
  return "Page";
}
