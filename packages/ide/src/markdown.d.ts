/**
 * Arquivos Markdown importados pelo código chegam como texto (ver `loader` no angular.json).
 */
declare module "*.md" {
  const contents: string;
  export default contents;
}
