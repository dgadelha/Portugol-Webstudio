import { Injectable } from "@angular/core";
import { decode } from "iconv-lite";
import { detect } from "jschardet";

@Injectable({ providedIn: "root" })
export class FileService {
  async getContents(file: File) {
    const buffer = await file.arrayBuffer();
    const array = new Uint8Array(buffer);
    let string = "";

    for (let i = 0; i < array.length; ++i) {
      string += String.fromCodePoint(array[i]);
    }

    const { encoding, confidence } = detect(string);

    console.log("Opening", {
      name: file.name,
      encoding,
      confidence,
    });

    return decode(array as any, encoding);
  }
}
