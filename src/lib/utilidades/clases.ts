export function unirClases(...clases: Array<string | false | null | undefined>) {
  return clases.filter(Boolean).join(" ");
}
