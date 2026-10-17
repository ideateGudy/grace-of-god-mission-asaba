/**
 * High-Resolution Client-Side Flyer Exporter
 * Converts SVG DOM elements into crystal-clear PNG / JPEG files
 * or copies directly to the user's system clipboard without server roundtrips.
 */

function svgToCanvas(
  svgElement: SVGSVGElement,
  scale = 1
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    try {
      const bbox = svgElement.viewBox.baseVal;
      const targetWidth = (bbox.width || 1080) * scale;
      const targetHeight = (bbox.height || 1080) * scale;

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      // Ensure xmlns is present
      if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
        svgString = svgString.replace(
          "<svg",
          '<svg xmlns="http://www.w3.org/2000/svg"'
        );
      }

      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Could not create 2D canvas context."));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        URL.revokeObjectURL(url);
        resolve(canvas);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Downloads the flyer as a high-resolution PNG image.
 */
export async function downloadFlyerPng(
  svgElement: SVGSVGElement,
  filename = "ggm-church-flyer.png",
  scale = 1
): Promise<void> {
  const canvas = await svgToCanvas(svgElement, scale);
  const dataUrl = canvas.toDataURL("image/png");

  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Downloads the flyer as a lightweight JPEG image (optimized for WhatsApp Status).
 */
export async function downloadFlyerJpeg(
  svgElement: SVGSVGElement,
  filename = "ggm-church-flyer.jpg",
  quality = 0.92
): Promise<void> {
  const canvas = await svgToCanvas(svgElement, 1);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);

  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename.endsWith(".jpg") ? filename : `${filename}.jpg`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/**
 * Copies the flyer PNG directly to the system clipboard for immediate pasting.
 */
export async function copyFlyerToClipboard(
  svgElement: SVGSVGElement
): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error("Clipboard copy is not supported in this browser.");
  }

  const canvas = await svgToCanvas(svgElement, 1);
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Canvas rasterization returned empty blob."));
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    }, "image/png");
  });
}
