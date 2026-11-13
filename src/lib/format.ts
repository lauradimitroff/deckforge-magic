const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Paris" });

/** Date courte en français, fuseau de Paris (identique côté serveur et navigateur). */
export const formatDate = (d: Date) => dateFmt.format(d);

export const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;
