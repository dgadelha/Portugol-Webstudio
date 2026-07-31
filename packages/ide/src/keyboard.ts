import type { PortugolExecutor, PortugolMessage } from "@portugol-webstudio/runner";

export const keyCodeMap: { [key: string]: number } = {
  'backspace': 8, 'tab': 9, 'enter': 13, 'shift': 16, 'ctrl': 17, 'alt': 18,
  'pause': 19, 'capslock': 20, 'escape': 27, 'space': 32, 'pageup': 33,
  'pagedown': 34, 'end': 35, 'home': 36, 'left': 37, 'up': 38, 'right': 39,
  'down': 40, 'insert': 45, 'delete': 46
};
function getKeyFromMap(key: string) {
  if (key.startsWith("Key")) return key.codePointAt(3) || -1;
  if (!keyCodeMap[key.toLowerCase()]) return -1;
  return keyCodeMap[key];
}

export class PortugolKeyboard {
  private pressedKeys = new Set<number>();
  public constructor(private executor: PortugolExecutor) {
    document.addEventListener("keydown", ev => {
      this.pressedKeys.add(getKeyFromMap(ev.code));
    });
    document.addEventListener("keyup", ev => {
      this.pressedKeys.delete(getKeyFromMap(ev.code));
    });
  }
  private waitForKey() {
    return new Promise<number>(resolve => {
      const fc = (ev: KeyboardEvent) => {
        document.removeEventListener("keydown", fc);
        resolve(getKeyFromMap(ev.code));
      };
      document.addEventListener("keydown", fc);
    });
  }
  async handleKeyboardMessage(message: PortugolMessage) {
    switch (message.type) {
      case "keyboard.isKeyPressed": {
        this.executor.replyMessage(message, this.pressedKeys.has(message.data as number));
        break;
      }
      case "keyboard.anyKeyPressed": {
        this.executor.replyMessage(message, this.pressedKeys.size > 0);
        break;
      }
      case "keyboard.waitForKey": {
        this.executor.replyMessage(message, await this.waitForKey());
        break;
      }
    }
  }
}
