"use strict";

const OUT_SIZE = 112;
const MAX_FRAME = 4;
const CACHE_SIZE = 256;
const DEFAULTS = Object.freeze({
  squish: 1.25,
  scale: 0.85,
  delay: 60,
  spriteX: 14,
  spriteY: 20,
  spriteWidth: 112,
  spriteHeight: 112,
  currentFrame: 0,
  flip: false,
  handStyle: "us",
  germanStyle: "poster",
  styleIntensity: 0.85,
  uniformOpacity: 0.62,
  capOffsetY: -8,
  uniformOffsetY: 24,
});

const state = { ...DEFAULTS };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const HAND_STYLES = Object.freeze({
  us: {
    label: "美式掌心向下",
    skin: "#ffd8b7",
    shade: "#edb48d",
    stroke: "#673820",
    sleeve: "#2f5362",
    palmAngle: -0.18,
    fingerAngle: 0.06,
    fingerSpread: 2.1,
    fingerCount: 4,
    palmOut: false,
    poses: [
      { x: 0, y: 0, rot: -0.03, jitterX: 0, jitterY: 0, wrist: 0 },
      { x: 1, y: -1, rot: -0.02, jitterX: 1, jitterY: -1, wrist: 1 },
      { x: -1, y: 1, rot: -0.04, jitterX: -1, jitterY: 1, wrist: -1 },
      { x: 1, y: 0, rot: -0.02, jitterX: 1, jitterY: 0, wrist: 1 },
      { x: 0, y: 0, rot: -0.03, jitterX: 0, jitterY: 0, wrist: 0 },
    ],
    avatar: [
      { x: 0, y: 0, w: 0, h: 0 },
      { x: 1, y: 0, w: 0, h: 0 },
      { x: -1, y: 1, w: 0, h: 0 },
      { x: 1, y: -1, w: 0, h: 0 },
      { x: 0, y: 0, w: 0, h: 0 },
    ],
  },
  british: {
    label: "英式掌心向外",
    skin: "#ffd2a8",
    shade: "#e9a47d",
    stroke: "#68351f",
    sleeve: "#263f55",
    palmAngle: -0.08,
    fingerAngle: 0.02,
    fingerSpread: 2.9,
    fingerCount: 4,
    palmOut: true,
    poses: [
      { x: 0, y: 1, rot: 0.02, jitterX: 0, jitterY: 0, wrist: 0 },
      { x: 1, y: 0, rot: 0.03, jitterX: 1, jitterY: -1, wrist: 1 },
      { x: -1, y: 2, rot: 0.0, jitterX: -1, jitterY: 1, wrist: -1 },
      { x: 1, y: 1, rot: 0.03, jitterX: 1, jitterY: 0, wrist: 1 },
      { x: 0, y: 1, rot: 0.02, jitterX: 0, jitterY: 0, wrist: 0 },
    ],
    avatar: [
      { x: 0, y: 0, w: 0, h: 0 },
      { x: 1, y: -1, w: 0, h: 0 },
      { x: -1, y: 1, w: 0, h: 0 },
      { x: 1, y: -1, w: 0, h: 0 },
      { x: 0, y: 0, w: 0, h: 0 },
    ],
  },
  polish: {
    label: "波兰双指军礼",
    skin: "#ffe0bd",
    shade: "#efba92",
    stroke: "#704126",
    sleeve: "#4b5b68",
    palmAngle: -0.12,
    fingerAngle: 0.04,
    fingerSpread: 3.2,
    fingerCount: 2,
    palmOut: true,
    poses: [
      { x: -1, y: 0, rot: -0.02, jitterX: 0, jitterY: 0, wrist: 0 },
      { x: 0, y: -1, rot: -0.01, jitterX: 1, jitterY: -1, wrist: 1 },
      { x: -2, y: 1, rot: -0.04, jitterX: -1, jitterY: 1, wrist: -1 },
      { x: 0, y: 0, rot: -0.01, jitterX: 1, jitterY: 0, wrist: 1 },
      { x: -1, y: 0, rot: -0.02, jitterX: 0, jitterY: 0, wrist: 0 },
    ],
    avatar: [
      { x: 0, y: 0, w: 0, h: 0 },
      { x: 1, y: 0, w: 0, h: 0 },
      { x: 0, y: 1, w: 0, h: 0 },
      { x: -1, y: 0, w: 0, h: 0 },
      { x: 0, y: 0, w: 0, h: 0 },
    ],
  },
  french: {
    label: "欧式贴帽檐",
    skin: "#f4c9a4",
    shade: "#dca078",
    stroke: "#5f3524",
    sleeve: "#394a65",
    palmAngle: -0.24,
    fingerAngle: 0.08,
    fingerSpread: 1.9,
    fingerCount: 4,
    palmOut: false,
    poses: [
      { x: 1, y: -2, rot: -0.08, jitterX: 0, jitterY: 0, wrist: -1 },
      { x: 2, y: -3, rot: -0.07, jitterX: 1, jitterY: -1, wrist: 0 },
      { x: 0, y: -1, rot: -0.1, jitterX: -1, jitterY: 1, wrist: -1 },
      { x: 2, y: -2, rot: -0.07, jitterX: 1, jitterY: 0, wrist: 0 },
      { x: 1, y: -2, rot: -0.08, jitterX: 0, jitterY: 0, wrist: -1 },
    ],
    avatar: [
      { x: 0, y: 0, w: 0, h: 0 },
      { x: 1, y: 0, w: 0, h: 0 },
      { x: -1, y: 1, w: 0, h: 0 },
      { x: 1, y: 0, w: 0, h: 0 },
      { x: 0, y: 0, w: 0, h: 0 },
    ],
  },
  casual: {
    label: "自然弯臂军礼",
    skin: "#ffd9b5",
    shade: "#e7ae86",
    stroke: "#673820",
    sleeve: "#47605e",
    palmAngle: -0.02,
    fingerAngle: 0.0,
    fingerSpread: 2.4,
    fingerCount: 4,
    palmOut: false,
    poses: [
      { x: -2, y: 4, rot: 0.03, jitterX: 0, jitterY: 0, wrist: 1 },
      { x: -1, y: 3, rot: 0.04, jitterX: 1, jitterY: -1, wrist: 2 },
      { x: -2, y: 5, rot: 0.02, jitterX: -1, jitterY: 1, wrist: 0 },
      { x: -3, y: 4, rot: 0.04, jitterX: -1, jitterY: 0, wrist: 1 },
      { x: -2, y: 4, rot: 0.03, jitterX: 0, jitterY: 0, wrist: 1 },
    ],
    avatar: [
      { x: 0, y: 0, w: 0, h: 0 },
      { x: 1, y: 0, w: 0, h: 0 },
      { x: 0, y: 1, w: 0, h: 0 },
      { x: -1, y: 0, w: 0, h: 0 },
      { x: 0, y: 0, w: 0, h: 0 },
    ],
  },
});

const HAND_SPRITES = Object.freeze({
  us: "assets/salute-us.png",
  british: "assets/salute-british.png",
  polish: "assets/salute-polish.png",
  french: "assets/salute-french.png",
  casual: "assets/salute-casual.png",
});

const DECORATION_SPRITES = Object.freeze({
  uniform: "assets/german-uniform.png",
  cap: "assets/german-cap.png",
  frame: "assets/german-frame.png",
  ribbon: "assets/german-ribbon.png",
});

let loop = null;
let playing = true;
let objectUrls = [];
const decorationImages = {};

function loadDecorationImages(onLoad) {
  Object.entries(DECORATION_SPRITES).forEach(([key, src]) => {
    const image = new Image();
    image.onload = onLoad;
    image.src = src;
    decorationImages[key] = image;
  });
}

function requestInterval(fn, delay) {
  let start = performance.now();
  const handle = {};
  function tick(now) {
    if (now - start >= delay) {
      fn();
      start = now;
    }
    handle.value = requestAnimationFrame(tick);
  }
  handle.value = requestAnimationFrame(tick);
  return handle;
}

function clearRequestInterval(handle) {
  if (handle && handle.value) cancelAnimationFrame(handle.value);
  return null;
}

function truncateMiddle(text, length) {
  if (text.length <= length) return text;
  const half = Math.floor(length / 2);
  return `${text.slice(0, half)}...${text.slice(-half)}`;
}

function rememberObjectUrl(url) {
  objectUrls.push(url);
  return url;
}

function revokeObjectUrls() {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls = [];
}

function createHandSprite(styleId = state.handStyle) {
  if (HAND_SPRITES[styleId]) return HAND_SPRITES[styleId];

  const canvas = document.createElement("canvas");
  canvas.width = OUT_SIZE * 5;
  canvas.height = OUT_SIZE;
  const ctx = canvas.getContext("2d");
  const style = getHandStyle(styleId);

  style.poses.forEach((pose, index) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(index * OUT_SIZE, 0, OUT_SIZE, OUT_SIZE);
    ctx.clip();
    ctx.translate(index * OUT_SIZE + pose.x - 10, pose.y);
    ctx.rotate(pose.rot);
    drawSaluteHand(ctx, pose, style);
    ctx.restore();
  });

  return canvas.toDataURL("image/png");
}

function getHandStyle(styleId = state.handStyle) {
  return HAND_STYLES[styleId] || HAND_STYLES.us;
}

function getAvatarFrameOffset(frame) {
  const style = getHandStyle();
  return style.avatar[frame] || { x: 0, y: 0, w: 0, h: 0 };
}

function getSaluteMotion(frame) {
  const amount = state.squish - 1;
  const shake = Math.min(2, Math.max(0, amount * 1.1));
  const motions = [
    { x: -36, y: 58, alpha: 1, sx: 0, sy: 0 },
    { x: -18, y: 31, alpha: 1, sx: 0, sy: 0 },
    { x: 0, y: 0, alpha: 1, sx: -1, sy: 1 },
    { x: -18, y: 31, alpha: 1, sx: 0, sy: 0 },
    { x: -36, y: 58, alpha: 1, sx: 0, sy: 0 },
  ];
  const motion = motions[frame] || motions[0];
  return {
    x: Math.trunc(motion.x + motion.sx * shake),
    y: Math.trunc(motion.y + motion.sy * shake),
    rot: 0,
    alpha: motion.alpha,
  };
}

function getStyleStrength() {
  if (state.germanStyle === "off") return 0;
  return clamp(Number(state.styleIntensity) || 0, 0, 1);
}

function drawGermanBackdrop(ctx, frame) {
  const strength = getStyleStrength();
  if (!strength) return;
  ctx.save();
  ctx.globalAlpha = strength;
  const gradient = ctx.createLinearGradient(0, 0, OUT_SIZE, OUT_SIZE);
  gradient.addColorStop(0, "#2a211b");
  gradient.addColorStop(0.5, "#5e1918");
  gradient.addColorStop(1, "#d5a83f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, OUT_SIZE, OUT_SIZE);

  ctx.globalAlpha = strength * (state.germanStyle === "minimal" ? 0.35 : 0.7);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 112, 21);
  ctx.fillStyle = "#8d2020";
  ctx.fillRect(0, 21, 112, 20);
  ctx.fillStyle = "#d6a943";
  ctx.fillRect(0, 41, 112, 12);

  ctx.globalAlpha = strength * 0.32;
  ctx.fillStyle = "#fff1bd";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(86, 0);
  ctx.lineTo(0, 72);
  ctx.closePath();
  ctx.fill();

  if (state.germanStyle === "poster") {
    ctx.globalAlpha = strength * 0.75;
    ctx.fillStyle = "#f2ddaa";
    ctx.font = "700 10px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(frame % 2 ? "TAKT" : "ORDNUNG", 56, 105);
  }
  ctx.restore();
}

function drawGermanOverlay(ctx) {
  const strength = getStyleStrength();
  if (!strength) return;
  if (state.germanStyle === "poster") {
    ctx.save();
    ctx.globalAlpha = strength * clamp(Number(state.uniformOpacity) || 0, 0, 1);
    ctx.beginPath();
    ctx.rect(0, 58, OUT_SIZE, OUT_SIZE - 58);
    ctx.clip();
    drawDecorationImage(ctx, "uniform", 0, state.uniformOffsetY);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = strength * 0.9;
    ctx.beginPath();
    ctx.rect(0, 0, OUT_SIZE, 58);
    ctx.clip();
    drawDecorationImage(ctx, "cap", 0, state.capOffsetY);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = strength * Math.min(0.85, clamp(Number(state.uniformOpacity) || 0, 0, 1) + 0.12);
    ctx.beginPath();
    ctx.rect(0, 58, OUT_SIZE, OUT_SIZE - 58);
    ctx.clip();
    drawDecorationImage(ctx, "ribbon", 0, state.uniformOffsetY);
    ctx.restore();
  } else if (state.germanStyle === "minimal") {
    ctx.save();
    ctx.globalAlpha = strength * 0.85;
    drawDecorationImage(ctx, "ribbon");
    ctx.restore();
  }
}

function drawGermanForeground(ctx, frame) {
  const strength = getStyleStrength();
  if (!strength) return;
  ctx.save();
  ctx.globalAlpha = strength * 0.9;
  drawDecorationImage(ctx, "frame");

  ctx.globalAlpha = strength * 0.16;
  ctx.fillStyle = "#fff4ca";
  for (let i = 0; i < 34; i += 1) {
    const x = (i * 37 + frame * 11) % OUT_SIZE;
    const y = (i * 19 + frame * 7) % OUT_SIZE;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function drawDecorationImage(ctx, key, x = 0, y = 0) {
  const image = decorationImages[key];
  if (image && image.complete && image.naturalWidth) {
    ctx.drawImage(image, x, y, OUT_SIZE, OUT_SIZE);
  }
}

function drawSaluteHand(ctx, pose, style) {
  ctx.save();
  ctx.translate(pose.jitterX, pose.jitterY);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = 2.2;

  drawSaluteSleeve(ctx, style);
  drawSaluteForearm(ctx, style, pose);
  drawSalutePalm(ctx, style, pose);
  drawSaluteFingers(ctx, style, pose);
  ctx.restore();
}

function drawSaluteSleeve(ctx, style) {
  drawThickSegment(ctx, 0, 94, 22, 78, 19, style.sleeve, style.stroke);
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, 88);
  ctx.lineTo(23, 75);
  ctx.stroke();
  ctx.restore();
}

function drawSaluteForearm(ctx, style, pose) {
  drawThickSegment(ctx, 18, 80, 38, 51 + pose.wrist, 16, style.skin, style.stroke);
  ctx.save();
  ctx.strokeStyle = style.shade;
  ctx.globalAlpha = 0.34;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(23, 77);
  ctx.lineTo(40, 54 + pose.wrist);
  ctx.stroke();
  ctx.restore();
}

function drawSalutePalm(ctx, style, pose) {
  ctx.save();
  ctx.translate(43, 48 + pose.wrist * 0.35);
  ctx.rotate(-0.62 + style.palmAngle);
  ctx.fillStyle = style.skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, style.palmOut ? 17 : 15, style.palmOut ? 13 : 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = style.palmOut ? 0.42 : 0.24;
  ctx.fillStyle = style.shade;
  ctx.beginPath();
  ctx.ellipse(2, 4, 10, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSaluteFingers(ctx, style, pose) {
  const baseX = 44;
  const baseY = 43 + pose.wrist * 0.35;
  const length = style.palmOut ? 36 : 38;
  const slope = style.fingerAngle;
  const count = style.fingerCount;
  const spread = style.fingerSpread;
  const normalX = -0.15;
  const normalY = 1;

  for (let index = 0; index < count; index += 1) {
    const centered = index - (count - 1) / 2;
    const startX = baseX + centered * spread * normalX;
    const startY = baseY + centered * spread * normalY;
    const endX = startX + length;
    const endY = startY - length * slope;
    const width = count === 2 ? 7.6 : 5.8 - Math.abs(centered) * 0.15;
    drawFingerStroke(ctx, startX, startY, endX, endY, width, style);
  }

  if (count === 2) {
    drawFoldedFinger(ctx, 37, 45 + pose.wrist * 0.3, style);
    drawFoldedFinger(ctx, 41, 49 + pose.wrist * 0.3, style);
  }

  ctx.save();
  ctx.translate(35, 56 + pose.wrist * 0.4);
  ctx.rotate(-0.74);
  ctx.fillStyle = style.skin;
  roundRect(ctx, -2, -6, 24, 11, 7);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawThickSegment(ctx, x1, y1, x2, y2, width, fill, stroke) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width + 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = fill;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawFingerStroke(ctx, x1, y1, x2, y2, width, style) {
  ctx.save();
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = width + 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = style.skin;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 245, 225, 0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x1 + (x2 - x1) * 0.2, y1 + (y2 - y1) * 0.2);
  ctx.lineTo(x1 + (x2 - x1) * 0.82, y1 + (y2 - y1) * 0.82);
  ctx.stroke();
  ctx.restore();
}

function drawFoldedFinger(ctx, x, y, style) {
  ctx.save();
  ctx.strokeStyle = style.stroke;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 9, y + 3, x + 16, y - 1);
  ctx.stroke();
  ctx.strokeStyle = style.skin;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 9, y + 3, x + 16, y - 1);
  ctx.stroke();
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function createSampleImage() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 256, 256);
  gradient.addColorStop(0, "#57d8c9");
  gradient.addColorStop(1, "#ffcd56");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#fff7df";
  ctx.beginPath();
  ctx.arc(128, 128, 76, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2b2928";
  ctx.beginPath();
  ctx.arc(101, 116, 9, 0, Math.PI * 2);
  ctx.arc(155, 116, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2b2928";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(128, 136, 31, 0.15, Math.PI - 0.15);
  ctx.stroke();
  return canvas.toDataURL("image/png");
}

function ImageLoader(onLoad, onError) {
  const cacheCanvas = document.createElement("canvas");
  const cacheCtx = cacheCanvas.getContext("2d");
  const image = new Image();
  image.crossOrigin = "anonymous";

  image.onload = () => {
    cacheCanvas.width = CACHE_SIZE;
    cacheCanvas.height = Math.max(1, Math.round(CACHE_SIZE * (image.naturalHeight / image.naturalWidth)));
    cacheCtx.clearRect(0, 0, cacheCanvas.width, cacheCanvas.height);
    cacheCtx.drawImage(image, 0, 0, cacheCanvas.width, cacheCanvas.height);
    try {
      onLoad(cacheCanvas.toDataURL("image/png"));
    } catch (error) {
      onError(error);
    }
  };
  image.onerror = onError;

  return {
    load(src) {
      image.src = src;
    },
  };
}

function SaluteAnimation(canvas, hand, sprite) {
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ff2a1f";
  let allowAdjust = false;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let offsetScale = 1;

  function refreshSprite() {
    if (!sprite.naturalWidth) return;
    state.spriteHeight = state.spriteWidth * (sprite.naturalHeight / sprite.naturalWidth);
  }

  function getSpriteFrame(frame) {
    const jitter = getAvatarFrameOffset(frame);
    const amount = state.squish - 1;
    return {
      dx: Math.trunc(state.spriteX + jitter.x * amount),
      dy: Math.trunc(state.spriteY + jitter.y * amount),
      dw: Math.trunc((state.spriteWidth + jitter.w * amount) * state.scale),
      dh: Math.trunc((state.spriteHeight + jitter.h * amount) * state.scale),
    };
  }

  function renderFrame(frame, targetCtx = ctx, adjust = allowAdjust) {
    if (!hand.complete || !sprite.complete || !sprite.naturalWidth) return;
    const cf = getSpriteFrame(frame);
    targetCtx.globalAlpha = 1;
    targetCtx.clearRect(0, 0, OUT_SIZE, OUT_SIZE);
    drawGermanBackdrop(targetCtx, frame);

    targetCtx.save();
    targetCtx.translate(cf.dx, cf.dy);
    let drawWidth = cf.dw;
    if (state.flip) {
      targetCtx.scale(-1, 1);
      drawWidth *= -1;
    }
    targetCtx.drawImage(sprite, 0, 0, drawWidth, cf.dh);
    if (adjust) targetCtx.strokeRect(0, 0, drawWidth, cf.dh);
    targetCtx.restore();
    drawGermanOverlay(targetCtx);

    if (adjust) targetCtx.globalAlpha = 0.75;
    const handY = Math.max(0, Math.trunc(cf.dy * 0.75 - Math.max(0, state.spriteY) - 0.5));
    const motion = getSaluteMotion(frame);
    targetCtx.save();
    targetCtx.globalAlpha = adjust ? 0.75 : motion.alpha;
    targetCtx.translate(18 + motion.x, handY + 88 + motion.y);
    targetCtx.rotate(motion.rot);
    targetCtx.translate(-18, -88);
    targetCtx.drawImage(hand, frame * OUT_SIZE, 0, OUT_SIZE, OUT_SIZE, 0, 0, OUT_SIZE, OUT_SIZE);
    targetCtx.restore();
    drawGermanForeground(targetCtx, frame);
    targetCtx.globalAlpha = 1;
  }

  function tick() {
    requestAnimationFrame(() => renderFrame(state.currentFrame));
  }

  function play() {
    if (loop) return;
    loop = requestInterval(() => {
      renderFrame(state.currentFrame);
      state.currentFrame = (state.currentFrame + 1) % 5;
    }, state.delay);
    playing = true;
    $("#playIcon").textContent = "Ⅱ";
  }

  function stop() {
    loop = clearRequestInterval(loop);
    playing = false;
    $("#playIcon").textContent = "▶";
    tick();
  }

  function seek(amount) {
    stop();
    const nextFrame = (state.currentFrame + amount) % 5;
    state.currentFrame = nextFrame < 0 ? MAX_FRAME : nextFrame;
    tick();
  }

  function updateRelativeOffset() {
    const bounds = canvas.getBoundingClientRect();
    offsetX = bounds.left;
    offsetY = bounds.top;
    offsetScale = OUT_SIZE / bounds.width;
  }

  function toggleAdjust(force) {
    allowAdjust = typeof force === "boolean" ? force : !allowAdjust;
    canvas.classList.toggle("adjust-mode", allowAdjust);
    if (allowAdjust) {
      state.currentFrame = 0;
      stop();
      canvas.focus();
    }
    updateRelativeOffset();
    tick();
  }

  function inSpriteBounds(frame, x, y) {
    const cf = getSpriteFrame(frame);
    return x > cf.dx && x < cf.dx + cf.dw && y > cf.dy && y < cf.dy + cf.dh;
  }

  window.addEventListener("scroll", updateRelativeOffset, { passive: true });
  window.addEventListener("resize", updateRelativeOffset);

  canvas.addEventListener("pointerdown", (event) => {
    if (!allowAdjust) return;
    event.preventDefault();
    updateRelativeOffset();
    startX = Math.trunc((event.clientX - offsetX) * offsetScale);
    startY = Math.trunc((event.clientY - offsetY) * offsetScale);
    dragging = inSpriteBounds(state.currentFrame, startX, startY);
    if (dragging) canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    event.preventDefault();
    const mouseX = Math.trunc((event.clientX - offsetX) * offsetScale);
    const mouseY = Math.trunc((event.clientY - offsetY) * offsetScale);
    state.spriteX += mouseX - startX;
    state.spriteY += mouseY - startY;
    startX = mouseX;
    startY = mouseY;
    tick();
  });

  ["pointerup", "pointercancel", "pointerout"].forEach((name) => {
    canvas.addEventListener(name, () => {
      dragging = false;
    });
  });

  canvas.addEventListener("keydown", (event) => {
    if (!allowAdjust) return;
    const keyMap = {
      ArrowLeft: [-1, 0],
      Left: [-1, 0],
      ArrowRight: [1, 0],
      Right: [1, 0],
      ArrowUp: [0, -1],
      Up: [0, -1],
      ArrowDown: [0, 1],
      Down: [0, 1],
    };
    const delta = keyMap[event.key];
    if (!delta) return;
    event.preventDefault();
    state.spriteX += delta[0];
    state.spriteY += delta[1];
    tick();
  });

  sprite.addEventListener("load", () => {
    refreshSprite();
    tick();
  });

  return { tick, play, stop, seek, renderFrame, toggleAdjust, refreshSprite };
}

function GifRenderer(animation) {
  const renderCanvas = document.createElement("canvas");
  const renderCtx = renderCanvas.getContext("2d", { willReadFrequently: true });
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  renderCanvas.width = renderCanvas.height = OUT_SIZE;
  tempCanvas.width = tempCanvas.height = OUT_SIZE;

  function optimizeFrameColors(data) {
    for (let i = 0; i < data.length; i += 4) {
      data[i + 1] = data[i + 1] > 250 ? 250 : data[i + 1];
      if (data[i + 3] < 120) {
        data[i] = 0;
        data[i + 1] = 255;
        data[i + 2] = 0;
      }
      data[i + 3] = 255;
    }
  }

  return {
    render() {
      const exportBtn = $("#export");
      const info = $("#info");
      const result = $("#result");
      const download = $("#download");
      const started = performance.now();

      const gif = new GIF({
        workers: 2,
        workerScript: "vendor/gif.worker.js",
        width: OUT_SIZE,
        height: OUT_SIZE,
        transparent: 0x00ff00,
      });
      const frameDelay = clamp(state.delay, 20, 1000);

      for (let i = 0; i <= MAX_FRAME; i += 1) {
        tempCtx.clearRect(0, 0, OUT_SIZE, OUT_SIZE);
        animation.renderFrame(i, tempCtx, false);
        const imgData = tempCtx.getImageData(0, 0, OUT_SIZE, OUT_SIZE);
        optimizeFrameColors(imgData.data);
        renderCtx.putImageData(imgData, 0, 0);
        gif.addFrame(renderCtx, { copy: true, delay: frameDelay });
      }

      exportBtn.disabled = true;
      gif.on("progress", (progress) => {
        const percent = `${Math.round(progress * 100)}%`;
        exportBtn.textContent = percent;
        info.textContent = percent;
      });
      gif.on("finished", (blob) => {
        const url = rememberObjectUrl(URL.createObjectURL(blob));
        const timeTaken = ((performance.now() - started) / 1000).toFixed(2);
        const fileSize = (blob.size / 1000).toFixed(2);
        result.src = url;
        download.href = url;
        download.classList.remove("disabled");
        info.textContent = `100%，用时 ${timeTaken} 秒，${fileSize} KB`;
        exportBtn.textContent = "导出";
        exportBtn.disabled = false;
      });
      gif.render();
    },
  };
}

window.addEventListener("DOMContentLoaded", () => {
  const canvas = $("#canvas");
  const preview = $("#uploadPreview");
  const hand = new Image();
  hand.crossOrigin = "anonymous";
  hand.src = createHandSprite(state.handStyle);

  const animation = SaluteAnimation(canvas, hand, preview);
  loadDecorationImages(() => animation.tick());
  const loader = ImageLoader(
    (dataUrl) => {
      preview.classList.remove("error");
      preview.src = dataUrl;
      $("#uploadError").textContent = "";
      animation.tick();
    },
    () => {
      preview.classList.add("error");
      $("#uploadError").textContent = "图片加载失败！";
    }
  );

  function reset() {
    Object.assign(state, DEFAULTS);
    animation.refreshSprite();
    $("#squish").value = Math.round(DEFAULTS.squish * 100);
    $("#scale").value = Math.round(DEFAULTS.scale * 100);
    $("#fps").value = $("#fpsVal").value = Math.round(1000 / DEFAULTS.delay);
    $("#toggleFlip").checked = false;
    $("#toggleAdjust").checked = false;
    $("#handStyle").value = DEFAULTS.handStyle;
    $("#germanStyle").value = DEFAULTS.germanStyle;
    $("#styleIntensity").value = Math.round(DEFAULTS.styleIntensity * 100);
    $("#uniformOpacity").value = Math.round(DEFAULTS.uniformOpacity * 100);
    $("#capOffsetY").value = DEFAULTS.capOffsetY;
    $("#uniformOffsetY").value = DEFAULTS.uniformOffsetY;
    hand.src = createHandSprite(DEFAULTS.handStyle);
    updateOutputs();
    animation.toggleAdjust(false);
    if (playing) {
      loop = clearRequestInterval(loop);
      animation.play();
    } else {
      animation.tick();
    }
  }

  function updateOutputs() {
    $("#scaleOut").textContent = $("#scale").value;
    $("#squishOut").textContent = $("#squish").value;
    $("#styleIntensityOut").textContent = $("#styleIntensity").value;
    $("#uniformOpacityOut").textContent = $("#uniformOpacity").value;
    $("#capOffsetYOut").textContent = $("#capOffsetY").value;
    $("#uniformOffsetYOut").textContent = $("#uniformOffsetY").value;
  }

  $("#reset").addEventListener("click", reset);

  const dropArea = $("#dropArea");
  const fileInput = $("#uploadFile");
  const fileName = $("#uploadFileName");

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    revokeObjectUrls();
    fileName.textContent = truncateMiddle(file.name, 22);
    fileName.title = file.name;
    loader.load(rememberObjectUrl(URL.createObjectURL(file)));
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach((name) => {
    dropArea.addEventListener(name, (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });
  ["dragenter", "dragover"].forEach((name) => {
    dropArea.addEventListener(name, () => dropArea.classList.add("highlight"));
  });
  ["dragleave", "drop"].forEach((name) => {
    dropArea.addEventListener(name, () => dropArea.classList.remove("highlight"));
  });
  dropArea.addEventListener("drop", (event) => handleFile(event.dataTransfer.files[0]));
  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]));

  $("#uploadUrlBtn").addEventListener("click", () => {
    const url = $("#uploadUrl").value.trim();
    if (!url) return;
    fileName.textContent = truncateMiddle(url, 24);
    fileName.title = url;
    loader.load(url);
  });

  $("#play").addEventListener("click", () => {
    if (loop) animation.stop();
    else animation.play();
  });
  $("#prev").addEventListener("click", () => animation.seek(-1));
  $("#next").addEventListener("click", () => animation.seek(1));

  ["input", "change"].forEach((eventName) => {
    $("#squish").addEventListener(eventName, (event) => {
      state.squish = Number((clamp(parseInt(event.target.value, 10), 100, 300) / 100).toFixed(3));
      updateOutputs();
      animation.tick();
    });
    $("#scale").addEventListener(eventName, (event) => {
      state.scale = Number((clamp(parseInt(event.target.value, 10), 15, 200) / 100).toFixed(3));
      updateOutputs();
      animation.tick();
    });
    $("#styleIntensity").addEventListener(eventName, (event) => {
      state.styleIntensity = Number((clamp(parseInt(event.target.value, 10), 0, 100) / 100).toFixed(3));
      updateOutputs();
      animation.tick();
    });
    $("#uniformOpacity").addEventListener(eventName, (event) => {
      state.uniformOpacity = Number((clamp(parseInt(event.target.value, 10), 0, 100) / 100).toFixed(3));
      updateOutputs();
      animation.tick();
    });
    $("#capOffsetY").addEventListener(eventName, (event) => {
      state.capOffsetY = clamp(parseInt(event.target.value, 10), -30, 20);
      updateOutputs();
      animation.tick();
    });
    $("#uniformOffsetY").addEventListener(eventName, (event) => {
      state.uniformOffsetY = clamp(parseInt(event.target.value, 10), 0, 45);
      updateOutputs();
      animation.tick();
    });
  });

  $("#fps").addEventListener("input", (event) => {
    $("#fpsVal").value = event.target.value;
  });
  $("#fpsVal").addEventListener("input", (event) => {
    $("#fps").value = clamp(parseInt(event.target.value || "2", 10), 2, 60);
  });
  $$("#fps, #fpsVal").forEach((input) => {
    input.addEventListener("change", (event) => {
      const fps = clamp(parseInt(event.target.value || "16", 10), 2, 60);
      $("#fps").value = $("#fpsVal").value = fps;
      const delay = Math.trunc(1000 / fps);
      if (delay !== state.delay) {
        state.delay = delay;
        if (loop) {
          loop = clearRequestInterval(loop);
          animation.play();
        }
      }
    });
  });

  $("#toggleFlip").addEventListener("change", (event) => {
    state.flip = event.target.checked;
    animation.tick();
  });
  $("#handStyle").addEventListener("change", (event) => {
    state.handStyle = event.target.value;
    hand.src = createHandSprite(state.handStyle);
    animation.tick();
  });
  $("#germanStyle").addEventListener("change", (event) => {
    state.germanStyle = event.target.value;
    animation.tick();
  });
  $("#toggleAdjust").addEventListener("change", (event) => animation.toggleAdjust(event.target.checked));

  const renderer = GifRenderer(animation);
  $("#export").addEventListener("click", () => renderer.render());

  $("#copy").addEventListener("click", async () => {
    const src = $("#result").src;
    if (!src) return;
    try {
      await navigator.clipboard.writeText(src);
      $("#info").textContent = "已复制临时链接";
    } catch {
      $("#info").textContent = "复制失败";
    }
  });

  $("#downloadSprite").addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = hand.src;
    link.download = "berlin-salute-sprite.png";
    link.click();
  });

  $("#themeToggle").addEventListener("click", () => {
    const html = document.documentElement;
    const next = html.dataset.theme === "dark" ? "light" : "dark";
    html.dataset.theme = next;
    localStorage.setItem("salute-theme", next);
    $("#themeToggle").textContent = next === "dark" ? "☾" : "☀";
  });

  const savedTheme = localStorage.getItem("salute-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $("#themeToggle").textContent = document.documentElement.dataset.theme === "dark" ? "☾" : "☀";

  loader.load(createSampleImage());
  updateOutputs();
  hand.onload = () => animation.tick();
  window.addEventListener("load", () => animation.play());

  window.salute = {
    state,
    DEFAULTS,
    HAND_STYLES,
    animation,
    renderer,
    hand,
    loader,
    reset,
  };
});
