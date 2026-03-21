import { APP_BANNER } from '@/consts';
import { retro } from 'gradient-string';

export function renderTitle() {
  console.log(retro.multiline(APP_BANNER));
}