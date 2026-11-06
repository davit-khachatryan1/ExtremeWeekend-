/* An amount with a smaller currency unit ("18 000" big, "դրամ" small) —
 * keeps big display prices from overflowing narrow tiles. */
import { T, type Lang } from '../config/content';
import { num } from '../lib/format';
import { cx } from './motion';

export function Money({ value, lang, unitClassName }: { value: number; lang: Lang; unitClassName?: string }) {
  return (
    <span className="whitespace-nowrap">
      {num(value)}
      <span className={cx('ml-1.5 font-sans text-[0.5em] font-semibold tracking-normal opacity-80', unitClassName)}>{T.common.amd[lang]}</span>
    </span>
  );
}
