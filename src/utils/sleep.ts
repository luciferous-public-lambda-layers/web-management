export function sleep(sec: number): Promise<void> {
  return new Promise((ok) => {
    setTimeout(() => ok(), sec * 1000);
  });
}
