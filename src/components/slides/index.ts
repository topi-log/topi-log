import { Image } from 'astro:assets';
import Box from './Box.astro';
import Columns from './Columns.astro';
import Place from './Place.astro';

export { Box, Columns, Image, Place };

/** MDX 側で import せずに使えるようにするコンポーネント */
export const slideComponents = { Box, Columns, Image, Place };
