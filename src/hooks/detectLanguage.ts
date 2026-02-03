export function isCzechUser(): boolean {
  if (typeof window === "undefined") return false;

  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages.some((lang) => lang.startsWith("cs"));
  }

  return navigator.language.startsWith("cs");
}
