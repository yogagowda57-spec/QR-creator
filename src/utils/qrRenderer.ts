import QRCode from "qrcode";
import { QRConfig } from "../types";

export interface FinderPatternInfo {
  type: "top-left" | "top-right" | "bottom-left";
  r: number;
  c: number;
}

export function getFinderPatternInfo(row: number, col: number, size: number): FinderPatternInfo | null {
  if (row < 7 && col < 7) {
    return { type: "top-left", r: row, c: col };
  }
  if (row < 7 && col >= size - 7) {
    return { type: "top-right", r: row, c: col - (size - 7) };
  }
  if (row >= size - 7 && col < 7) {
    return { type: "bottom-left", r: row - (size - 7), c: col };
  }
  return null;
}

// Draw rounded rectangle path
export function pathRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h - r);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

// Draw leaf-shape rectangle path (based on corner type)
export function pathLeaf(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  type: "top-left" | "top-right" | "bottom-left"
) {
  ctx.moveTo(x, y);
  if (type === "top-left") {
    // Round top-left & bottom-right
    ctx.arcTo(x + w, y, x + w, y + h, 0); // top-right sharp
    ctx.arcTo(x + w, y + h, x, y + h, w / 2); // bottom-right round
    ctx.arcTo(x, y + h, x, y, 0); // bottom-left sharp
    ctx.arcTo(x, y, x + w, y, w / 2); // top-left round
  } else if (type === "top-right") {
    // Round top-right & bottom-left
    ctx.arcTo(x + w, y, x + w, y + h, w / 2); // top-right round
    ctx.arcTo(x + w, y + h, x, y + h, 0); // bottom-right sharp
    ctx.arcTo(x, y + h, x, y, w / 2); // bottom-left round
    ctx.arcTo(x, y, x + w, y, 0); // top-left sharp
  } else {
    // bottom-left: Round top-right & bottom-left
    ctx.arcTo(x + w, y, x + w, y + h, w / 2); // top-right round
    ctx.arcTo(x + w, y + h, x, y + h, 0); // bottom-right sharp
    ctx.arcTo(x, y + h, x, y, w / 2); // bottom-left round
    ctx.arcTo(x, y, x + w, y, 0); // top-left sharp
  }
}

// Draw shield path
export function pathShield(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const cx = x + w / 2;
  ctx.moveTo(cx, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + h * 0.4);
  ctx.quadraticCurveTo(x + w, y + h * 0.8, cx, y + h);
  ctx.quadraticCurveTo(x, y + h * 0.8, x, y + h * 0.4);
  ctx.quadraticCurveTo(x, y, cx, y);
}

// Render the outer finder pattern frame
function drawOuterFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  style: string,
  color: string,
  cellSize: number,
  type: "top-left" | "top-right" | "bottom-left"
) {
  ctx.save();
  ctx.beginPath();
  
  const innerOffset = cellSize;
  const innerW = w - 2 * cellSize;

  if (style === "rounded") {
    const rOuter = 1.5 * cellSize;
    const rInner = Math.max(0, rOuter - cellSize);
    
    // Outer Path
    pathRoundedRect(ctx, x, y, w, w, rOuter);
    // Inner Path (drawn in opposite direction using evenodd)
    pathRoundedRect(ctx, x + innerOffset, y + innerOffset, innerW, innerW, rInner);
  } else if (style === "extra-rounded") {
    const rOuter = 2.5 * cellSize;
    const rInner = Math.max(0, rOuter - cellSize);
    
    pathRoundedRect(ctx, x, y, w, w, rOuter);
    pathRoundedRect(ctx, x + innerOffset, y + innerOffset, innerW, innerW, rInner);
  } else if (style === "circle") {
    const rOuter = w / 2;
    const rInner = innerW / 2;
    
    ctx.arc(x + rOuter, y + rOuter, rOuter, 0, 2 * Math.PI);
    ctx.arc(x + rOuter, y + rOuter, rInner, 2 * Math.PI, 0, true);
  } else if (style === "leaf") {
    pathLeaf(ctx, x, y, w, w, type);
    pathLeaf(ctx, x + innerOffset, y + innerOffset, innerW, innerW, type);
  } else if (style === "shield") {
    pathShield(ctx, x, y, w, w);
    pathShield(ctx, x + innerOffset, y + innerOffset, innerW, innerW);
  } else {
    // Standard square (Default)
    ctx.rect(x, y, w, w);
    ctx.rect(x + innerOffset, y + innerOffset, innerW, innerW);
  }

  ctx.fillStyle = color;
  ctx.fill("evenodd");
  ctx.restore();
}

// Render the inner finder pattern eye (3x3 modules)
function drawInnerFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  style: string,
  color: string,
  cellSize: number
) {
  ctx.save();
  ctx.beginPath();

  if (style === "circle") {
    ctx.arc(x + w / 2, y + w / 2, w / 2, 0, 2 * Math.PI);
  } else if (style === "diamond") {
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + w / 2);
    ctx.lineTo(x + w / 2, y + w);
    ctx.lineTo(x, y + w / 2);
    ctx.closePath();
  } else if (style === "star") {
    const cx = x + w / 2;
    const cy = y + w / 2;
    ctx.moveTo(cx, y);
    ctx.quadraticCurveTo(cx, cy, x + w, cy);
    ctx.quadraticCurveTo(cx, cy, cx, y + w);
    ctx.quadraticCurveTo(cx, cy, x, cy);
    ctx.quadraticCurveTo(cx, cy, cx, y);
  } else if (style === "heart") {
    const cx = x + w / 2;
    const cy = y + w / 2;
    // Simple custom heart path within the 3x3 eye
    ctx.moveTo(cx, cy + w / 3);
    ctx.bezierCurveTo(cx - w / 2, cy - w / 4, cx - w / 3, cy - w / 2, cx, cy - w / 4);
    ctx.bezierCurveTo(cx + w / 3, cy - w / 2, cx + w / 2, cy - w / 4, cx, cy + w / 3);
  } else if (style === "shield") {
    pathShield(ctx, x, y, w, w);
  } else {
    // default square
    ctx.rect(x, y, w, w);
  }

  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

// Helper to draw custom module dots
function drawDot(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  cellSize: number,
  style: string,
  color: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;

  const r = cellSize / 2;
  const mx = cx + r;
  const my = cy + r;

  if (style === "dots") {
    ctx.arc(mx, my, cellSize * 0.42, 0, 2 * Math.PI);
    ctx.fill();
  } else if (style === "rounded") {
    // Beautiful soft rounded cells
    ctx.arc(mx, my, cellSize * 0.48, 0, 2 * Math.PI);
    ctx.fill();
  } else if (style === "diamond") {
    ctx.moveTo(mx, cy);
    ctx.lineTo(cx + cellSize, my);
    ctx.lineTo(mx, cy + cellSize);
    ctx.lineTo(cx, my);
    ctx.closePath();
    ctx.fill();
  } else if (style === "star") {
    ctx.moveTo(mx, cy + 1);
    ctx.quadraticCurveTo(mx, my, cx + cellSize - 1, my);
    ctx.quadraticCurveTo(mx, my, mx, cy + cellSize - 1);
    ctx.quadraticCurveTo(mx, my, cx + 1, my);
    ctx.quadraticCurveTo(mx, my, mx, cy + 1);
    ctx.closePath();
    ctx.fill();
  } else if (style === "classy") {
    // Circular dot with subtle styling flares
    ctx.arc(mx, my, cellSize * 0.35, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    // Square (standard)
    ctx.rect(cx, cy, cellSize, cellSize);
    ctx.fill();
  }
  ctx.restore();
}

// Render QR Code onto canvas asynchronously
export async function renderQRCodeToCanvas(
  canvas: HTMLCanvasElement,
  config: QRConfig,
  logoImgElement?: HTMLImageElement | null
): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const {
    size,
    margin,
    text,
    foregroundColor,
    backgroundColor,
    isTransparent,
    errorCorrectionLevel,
    dotStyle,
    eyeStyle,
    innerEyeStyle,
    outerEyeColor,
    innerEyeColor,
    customEyeColor,
    logoUrl,
    logoSize,
    logoBorderRadius,
    logoBackgroundColor,
    logoPadding,
    hasLogoBackground,
  } = config;

  // Set canvas bounds
  canvas.width = size;
  canvas.height = size;

  // Clear or Fill background
  ctx.clearRect(0, 0, size, size);
  if (!isTransparent) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
  }

  // Create QR Matrix
  const qr = QRCode.create(text, { errorCorrectionLevel });
  const qrSize = qr.modules.size;
  const usableSize = size - 2 * margin;
  const cellSize = usableSize / qrSize;

  // Compute central block boundaries for Logo to prevent visual overlapping
  let logoMin = -1;
  let logoMax = -1;
  if (logoUrl) {
    const logoPxSize = size * (logoSize / 100);
    logoMin = (size - logoPxSize) / 2 - logoPadding;
    logoMax = (size + logoPxSize) / 2 + logoPadding;
  }

  // Draw regular modules
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      // 1. Skip if it is part of Finder Pattern (we'll draw high-quality vector eyes separately)
      if (getFinderPatternInfo(row, col, qrSize) !== null) {
        continue;
      }

      // 2. Skip if it is hidden/blocked by Center Logo bounding box
      const cx = margin + col * cellSize;
      const cy = margin + row * cellSize;
      
      if (logoUrl) {
        // Check overlap with logo center area
        const cellCenterX = cx + cellSize / 2;
        const cellCenterY = cy + cellSize / 2;
        if (
          cellCenterX >= logoMin &&
          cellCenterX <= logoMax &&
          cellCenterY >= logoMin &&
          cellCenterY <= logoMax
        ) {
          continue;
        }
      }

      // 3. Draw module if dark
      const isDark = qr.modules.get(row, col);
      if (isDark) {
        drawDot(ctx, cx, cy, cellSize, dotStyle, foregroundColor);
      }
    }
  }

  // Draw High-Quality Vector Finder Patterns
  const finderColors = {
    outer: customEyeColor ? outerEyeColor : foregroundColor,
    inner: customEyeColor ? innerEyeColor : foregroundColor,
  };

  const corners: Array<{
    type: "top-left" | "top-right" | "bottom-left";
    x: number;
    y: number;
  }> = [
    { type: "top-left", x: margin, y: margin },
    { type: "top-right", x: margin + (qrSize - 7) * cellSize, y: margin },
    { type: "bottom-left", x: margin, y: margin + (qrSize - 7) * cellSize },
  ];

  corners.forEach(({ type, x, y }) => {
    // Outer Frame (7x7 modules)
    drawOuterFinderPattern(
      ctx,
      x,
      y,
      7 * cellSize,
      eyeStyle,
      finderColors.outer,
      cellSize,
      type
    );

    // Inner Core (3x3 modules, centered at 2 modules offset)
    drawInnerFinderPattern(
      ctx,
      x + 2 * cellSize,
      y + 2 * cellSize,
      3 * cellSize,
      innerEyeStyle,
      finderColors.inner,
      cellSize
    );
  });

  // Draw Logo Overlay (if available and fully loaded)
  if (logoUrl) {
    let img: HTMLImageElement | null = logoImgElement || null;
    
    // If no preloaded image, load it dynamically
    if (!img) {
      img = await new Promise<HTMLImageElement | null>((resolve) => {
        const tempImg = new Image();
        tempImg.crossOrigin = "anonymous";
        tempImg.src = logoUrl;
        tempImg.onload = () => resolve(tempImg);
        tempImg.onerror = () => resolve(null);
      });
    }

    if (img) {
      const logoPxSize = size * (logoSize / 100);
      const lx = (size - logoPxSize) / 2;
      const ly = (size - logoPxSize) / 2;

      ctx.save();

      // Draw safety background mask behind logo
      if (hasLogoBackground) {
        ctx.beginPath();
        const bgSize = logoPxSize + 2 * logoPadding;
        const bgx = lx - logoPadding;
        const bgy = ly - logoPadding;
        const rBg = (logoBorderRadius / 100) * bgSize;

        if (rBg > 0) {
          ctx.beginPath();
          pathRoundedRect(ctx, bgx, bgy, bgSize, bgSize, rBg);
          ctx.closePath();
        } else {
          ctx.rect(bgx, bgy, bgSize, bgSize);
        }
        ctx.fillStyle = logoBackgroundColor;
        ctx.fill();
      }

      // Draw custom logo image with custom borders
      const rImg = (logoBorderRadius / 100) * logoPxSize;
      if (rImg > 0) {
        ctx.beginPath();
        pathRoundedRect(ctx, lx, ly, logoPxSize, logoPxSize, rImg);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, lx, ly, logoPxSize, logoPxSize);
      ctx.restore();
    }
  }
}

// Convert QR Code canvas to High Quality SVG String
export function renderQRCodeToSVG(config: QRConfig): string {
  const qr = QRCode.create(config.text, { errorCorrectionLevel: config.errorCorrectionLevel });
  const qrSize = qr.modules.size;
  const {
    size,
    margin,
    foregroundColor,
    backgroundColor,
    isTransparent,
    dotStyle,
    eyeStyle,
    innerEyeStyle,
    outerEyeColor,
    innerEyeColor,
    customEyeColor,
    logoUrl,
    logoSize,
  } = config;

  const usableSize = size - 2 * margin;
  const cellSize = usableSize / qrSize;

  const finderColors = {
    outer: customEyeColor ? outerEyeColor : foregroundColor,
    inner: customEyeColor ? innerEyeColor : foregroundColor,
  };

  let paths = "";

  // Background
  if (!isTransparent) {
    paths += `<rect width="${size}" height="${size}" fill="${backgroundColor}"/>\n`;
  }

  // Draw dots
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (getFinderPatternInfo(row, col, qrSize) !== null) continue;

      const cx = margin + col * cellSize;
      const cy = margin + row * cellSize;

      // Skip center logo block (SVG fallback simple calculation)
      if (logoUrl) {
        const logoPxSize = size * (logoSize / 100);
        const lMin = (size - logoPxSize) / 2;
        const lMax = (size + logoPxSize) / 2;
        const midX = cx + cellSize / 2;
        const midY = cy + cellSize / 2;
        if (midX >= lMin && midX <= lMax && midY >= lMin && midY <= lMax) {
          continue;
        }
      }

      if (qr.modules.get(row, col)) {
        if (dotStyle === "dots" || dotStyle === "rounded") {
          const r = cellSize / 2;
          paths += `<circle cx="${cx + r}" cy="${cy + r}" r="${cellSize * 0.42}" fill="${foregroundColor}"/>\n`;
        } else if (dotStyle === "diamond") {
          const mx = cx + cellSize / 2;
          const my = cy + cellSize / 2;
          paths += `<path d="M ${mx} ${cy} L ${cx + cellSize} ${my} L ${mx} ${cy + cellSize} L ${cx} ${my} Z" fill="${foregroundColor}"/>\n`;
        } else {
          // default square
          paths += `<rect x="${cx}" y="${cy}" width="${cellSize}" height="${cellSize}" fill="${foregroundColor}"/>\n`;
        }
      }
    }
  }

  // Draw Eyes Corner Frames (SVG representation)
  const drawCornerSVG = (x: number, y: number) => {
    // Simple Outer 7x7 square & Inner 3x3 square for SVG compatibility
    paths += `<rect x="${x}" y="${y}" width="${7 * cellSize}" height="${7 * cellSize}" rx="${eyeStyle === "rounded" || eyeStyle === "circle" ? cellSize : 0}" fill="none" stroke="${finderColors.outer}" stroke-width="${cellSize}"/>\n`;
    paths += `<rect x="${x + 2 * cellSize}" y="${y + 2 * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" rx="${innerEyeStyle === "circle" ? cellSize : 0}" fill="${finderColors.inner}"/>\n`;
  };

  drawCornerSVG(margin, margin);
  drawCornerSVG(margin + (qrSize - 7) * cellSize, margin);
  drawCornerSVG(margin, margin + (qrSize - 7) * cellSize);

  // Center logo placeholder or icon inside SVG
  if (logoUrl) {
    const logoPxSize = size * (logoSize / 100);
    const lx = (size - logoPxSize) / 2;
    const ly = (size - logoPxSize) / 2;
    paths += `<rect x="${lx - 4}" y="${ly - 4}" width="${logoPxSize + 8}" height="${logoPxSize + 8}" fill="${config.logoBackgroundColor}" rx="${(config.logoBorderRadius / 100) * (logoPxSize + 8)}"/>\n`;
    paths += `<image href="${logoUrl}" x="${lx}" y="${ly}" width="${logoPxSize}" height="${logoPxSize}" clip-path="inset(0% round ${config.logoBorderRadius}%)"/>\n`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">\n${paths}</svg>`;
}
