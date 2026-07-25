/* eslint-disable @next/next/no-img-element -- Local SVGs keep icons compatible with legacy browsers. */

type EmojiIconProps = {
  symbol: string;
  label?: string;
  className?: string;
};

function emojiCode(symbol: string) {
  return Array.from(symbol)
    .map((character) => character.codePointAt(0))
    .filter((codePoint) => codePoint !== undefined && codePoint !== 0xfe0f)
    .map((codePoint) => codePoint!.toString(16))
    .join("-");
}

export function EmojiIcon({ symbol, label = "", className = "" }: EmojiIconProps) {
  return (
    <img
      className={`emoji-icon ${className}`.trim()}
      src={`/emoji/${emojiCode(symbol)}.svg`}
      alt={label}
      draggable={false}
    />
  );
}
