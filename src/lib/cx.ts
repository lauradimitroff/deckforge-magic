/** Assemble des classes CSS en ignorant les valeurs vides. */
export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
