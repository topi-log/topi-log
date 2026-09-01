declare module 'remark-code-titles' {
  import type { Plugin } from 'unified';

  const remarkCodeTitles: Plugin<[], import('mdast').Root>;
  export default remarkCodeTitles;
}
