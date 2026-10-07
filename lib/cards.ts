import { zipSync, strToU8 } from "fflate";
export type CardSlide = {
  title: string;
  body: string;
  label: string;
  footer: string;
  index: number;
};
function lines(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const result: string[] = [];
  for (const p of text.split("\n")) {
    let line = "";
    const tokens = p.includes(" ") ? p.match(/\S+\s*/g) || [""] : [...p];
    for (const token of tokens) {
      if (ctx.measureText(token).width > width) {
        for (const char of token) {
          if (ctx.measureText(line + char).width > width && line) {
            result.push(line.trimEnd());
            line = char;
          } else line += char;
        }
      } else if (ctx.measureText(line + token).width > width && line) {
        result.push(line.trimEnd());
        line = token;
      } else line += token;
    }
    result.push(line.trimEnd());
  }
  return result;
}
export async function cardBlob(slide: CardSlide): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const c = canvas.getContext("2d");
  if (!c) throw new Error("Canvas unavailable");
  const palettes = [
    ["#173e43", "#f6f3e8", "#c9936d"],
    ["#f2eee4", "#244e4b", "#ad7657"],
    ["#e8eee1", "#315644", "#789875"],
  ];
  const [bg, fg, accent] = palettes[slide.index % 3];
  c.fillStyle = bg;
  c.fillRect(0, 0, 1080, 1350);
  c.fillStyle = fg;
  c.font = "600 43px Pretendard, sans-serif";
  c.fillText("돈쌤", 85, 115);
  c.font = "16px DM Sans, sans-serif";
  c.fillText("DON SSAEM", 86, 143);
  c.font = "18px Pretendard, sans-serif";
  c.textAlign = "right";
  c.fillText(
    `${String(slide.index + 1).padStart(2, "0")} / DON SSAEM JOURNAL`,
    995,
    110,
  );
  c.textAlign = "left";
  c.fillStyle = accent;
  c.font = "24px Pretendard, Noto Sans TC, sans-serif";
  c.fillText(slide.label, 85, 269);
  c.fillStyle = fg;
  let size = 67;
  c.font = `${size}px Gowun Batang, Noto Sans TC, serif`;
  let titles = lines(c, slide.title, 910);
  while (titles.length > 4 && size > 40) {
    size -= 3;
    c.font = `${size}px Gowun Batang, Noto Sans TC, serif`;
    titles = lines(c, slide.title, 910);
  }
  let y = 390;
  for (const line of titles) {
    c.fillText(line, 85, y);
    y += size * 1.5;
  }
  c.strokeStyle = accent;
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(85, y + 34);
  c.lineTo(180, y + 34);
  c.stroke();
  y += 116;
  size = 32;
  let bodyLines: string[] = [];
  do {
    c.font = `${size}px Pretendard, Noto Sans TC, sans-serif`;
    bodyLines = lines(c, slide.body, 890);
    if (y + bodyLines.length * size * 1.65 <= 1190) break;
    size -= 1;
  } while (size > 20);
  if (y + bodyLines.length * size * 1.65 > 1190)
    throw new Error("Card text is too long");
  for (const line of bodyLines) {
    c.fillText(line, 85, y);
    y += size * 1.65;
  }
  c.globalAlpha = 0.7;
  c.font = "21px Pretendard, Noto Sans TC, sans-serif";
  c.fillText(slide.footer.slice(0, 65), 85, 1270);
  c.globalAlpha = 1;
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG export failed"))),
      "image/png",
    ),
  );
}
function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export async function downloadCard(slide: CardSlide, name: string) {
  save(await cardBlob(slide), name);
}
export async function downloadCarousel(
  slides: CardSlide[],
  caption: string,
  filename: string,
) {
  const files: Record<string, Uint8Array> = {};
  for (const s of slides)
    files[`${String(s.index + 1).padStart(2, "0")}.png`] = new Uint8Array(
      await (await cardBlob(s)).arrayBuffer(),
    );
  files["caption.txt"] = strToU8(caption);
  save(
    new Blob([zipSync(files) as BlobPart], { type: "application/zip" }),
    filename + ".zip",
  );
}
