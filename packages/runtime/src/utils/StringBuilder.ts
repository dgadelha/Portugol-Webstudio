export class StringBuilder {
  buffer: string[] = [];

  append(...str: Array<string | null | undefined>) {
    this.buffer.push(...str.filter(Boolean).map(String));
  }

  pop() {
    return this.buffer.pop();
  }

  toString() {
    return this.buffer.join("");
  }
}
