export class StringBuilder {
  buffer: string[] = [];

  append(...str: string[]) {
    this.buffer.push(...str);
  }

  pop() {
    return this.buffer.pop();
  }

  toString() {
    return this.buffer.join("");
  }
}
