export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const textLength = text.split(' ').length;
  return Math.ceil(textLength / wordsPerMinute);
}
