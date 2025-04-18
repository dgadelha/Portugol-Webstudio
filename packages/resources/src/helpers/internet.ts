import { createWriteStream, promises as fs } from "node:fs";
import { Stream } from "node:stream";

import axios from "axios";

export async function getETag(url: string) {
  const res = await axios.head(url);

  return String(res.headers.etag ?? Date.now());
}

export async function download(url: string, dest: string) {
  const file = createWriteStream(dest, { flags: "wx" });

  try {
    const res = await axios.get<Stream>(url, { responseType: "stream" });

    if (res.status === 200) {
      await new Promise<void>((resolve, reject) => {
        res.data.pipe(file).once("error", reject).once("close", resolve);
      });
    } else {
      file.close();
      await fs.unlink(dest); // Delete temp file
      throw new Error(`Server responded with ${res.status}`);
    }
  } catch (error) {
    file.close();
    await fs.unlink(dest); // Delete temp file

    throw error;
  }
}
