/**
 * Single authoritative framing calculation for the Hero 3D Logo.
 * Fits any viewport, devicePixelRatio, and browser zoom level based on
 * the logo's real bounding box and the canvas's CSS layout.
 */
export function computeHeroFraming({
  logoWorldBounds = { size: [5.60, 2.78, 0.35], center: [0, 0, 0] },
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
  titleTop,
  canvasTop,
  headerBottom = 0,
  fov = 45,
}) {
  const logoWidthWorld = logoWorldBounds.size[0] || 5.60;
  const logoHeightWorld = logoWorldBounds.size[1] || 2.78;
  const logoDepthWorld = logoWorldBounds.size[2] || 0.35;
  const logoCenterYWorld = (logoWorldBounds.center && logoWorldBounds.center[1]) || 0;
  const logoAspect = logoWidthWorld / logoHeightWorld;

  const vw = viewportWidth || (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const vh = viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 900);
  const cw = canvasWidth || 896;
  const ch = canvasHeight || 576;

  // Rule constraints:
  // - Phone portrait: logo height <= 30% of viewport height (target 28% for breathing room)
  // - Desktop/other: logo height <= 42% of viewport height (target 38% for breathing room)
  // - Logo width <= 62% of viewport width (target 58% for breathing room)
  const isPhonePortrait = vw < 768 && vh > vw;
  const maxViewportHeightFrac = isPhonePortrait ? 0.28 : 0.38;
  const maxViewportWidthFrac = 0.58;

  const maxScreenH_vp = vh * maxViewportHeightFrac;
  const maxScreenW_vp = vw * maxViewportWidthFrac;

  // Rule constraint: min 16px margin on every side of the canvas (enforce 28px buffer)
  const minMargin = 28;
  const maxScreenW_canvas = Math.max(32, cw - minMargin * 2);
  const maxScreenH_canvas = Math.max(32, ch - minMargin * 2);

  // Rule constraint: at least 24px clear space between bottom of logo and top of VULCAN title (enforce 32px buffer)
  const minClearSpaceTitle = 32;
  const cTop = canvasTop != null ? canvasTop : (vh - ch) / 2;
  const tTop = titleTop != null ? titleTop : vh;

  const maxCanvasY_bottom = Math.min(
    ch - minMargin,
    (tTop - cTop) - minClearSpaceTitle
  );

  const hBottom = headerBottom || 0;
  const minCanvasY_top = (hBottom > cTop)
    ? Math.max(minMargin, (hBottom - cTop) + minMargin)
    : minMargin;

  const availableHeightAboveTitle = Math.max(32, maxCanvasY_bottom - minCanvasY_top);

  // Combined maximum allowable target dimensions
  const maxTargetW = Math.min(maxScreenW_vp, maxScreenW_canvas);
  const maxTargetH = Math.min(maxScreenH_vp, maxScreenH_canvas, availableHeightAboveTitle);

  // Preserve aspect ratio
  let targetWidthPx = maxTargetW;
  let targetHeightPx = targetWidthPx / logoAspect;

  if (targetHeightPx > maxTargetH) {
    targetHeightPx = maxTargetH;
    targetWidthPx = targetHeightPx * logoAspect;
  }

  // Camera distance Z:
  // In perspective projection, front corners at +depth/2 are closer to camera.
  // Adding depth/2 offset ensures the front 3D faces never exceed target pixels.
  const fovRad = (fov * Math.PI) / 180;
  const tanHalfFov = Math.tan(fovRad / 2);
  const depthOffset = (logoDepthWorld * 0.5) + 0.05;
  const cameraZ = ((logoHeightWorld * ch) / (2 * targetHeightPx * tanHalfFov)) + depthOffset;

  // Vertical placement: center in available space [minCanvasY_top, maxCanvasY_bottom]
  const targetScreenCenterY = (minCanvasY_top + maxCanvasY_bottom) / 2;
  const canvasCenterY = ch / 2;
  const screenOffsetY = targetScreenCenterY - canvasCenterY;

  // Screen Y to world Y: moving logo down on screen (+screenOffsetY) means camera must move up (+cameraY)
  const cameraY = (screenOffsetY * (logoHeightWorld / targetHeightPx)) + logoCenterYWorld;

  return {
    cameraZ,
    cameraY,
    lookAtY: cameraY,
    targetWidthPx,
    targetHeightPx,
    targetScreenCenterY,
    screenOffsetY,
    isPhonePortrait,
  };
}
