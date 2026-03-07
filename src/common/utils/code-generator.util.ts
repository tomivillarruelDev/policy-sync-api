/**
 * Utilidad centralizada para generar códigos únicos en el backend.
 * Asegura que el backend sea la única fuente de la verdad para
 * identificadores críticos (ej. pólizas, agentes, aseguradoras)
 * previniendo inyección/spoofing desde el frontend.
 * 
 * Formato: PRE-(Año)-(Hash8Chars)
 * Ejemplo: POL-2026-X1Y2Z3A4
 */
export function generateAutoCode(prefix: string): string {
    const currentYear = new Date().getFullYear();
    const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();

    return `${prefix}-${currentYear}-${randomHash}`;
}
