export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()

      // normalize accented chars: é → e, ñ → n
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

      // semantic replacements
      .replace(/&/g, " and ")
      .replace(/,/g, "")

      // replace any remaining non-alphanumeric chars with dashes
      .replace(/[^a-z0-9]+/g, "-")

      // trim leading/trailing dashes
      .replace(/^-+|-+$/g, "")
  );
}
