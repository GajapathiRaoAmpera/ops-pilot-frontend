/**
 * The landing hero: a pipeline in 3D. A run travels checkout → deploy, fails at test, Pilot scans it, a fix branch
 * grows to a pull request, waits at an approval gate, and the run passes. Plain Three.js from primitives, loaded on
 * demand. Every frame is a pure function of the story time, so seeking and reduced motion are just `render(t)`.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { STORY, STORY_LENGTH, stepAt } from "./story";

export interface PipelineScene {
  play(): void;
  pause(): void;
  /** Jump to the start of a story step (and render it, even when paused). */
  seek(step: number): void;
  /** Stop drawing while off screen; resumes if it was playing. */
  setVisible(visible: boolean): void;
  dispose(): void;
}

interface Options {
  /** Stage labels (checkout, install, build, test, deploy), then the pull request and the approval gate. */
  labels: readonly HTMLElement[];
  onStep(step: number): void;
  reducedMotion: boolean;
}

// The app's tokens: status colours mean status here too (passed, failed, waiting for approval).
const C = {
  track: 0x3b5273,
  node: 0x1b3252,
  run: 0x7dd3fc,
  pr: 0xa5b4fc,
  passed: 0x4ade80,
  failed: 0xf87171,
  waiting: 0xfbbf24,
  grid: 0x274063,
  fog: 0x0a1628,
};

const STAGE_X = [-6, -3, 0, 3, 6];
const TEST = 3;
const DEPLOY = 4;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, t: number) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

function glowTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createPipelineScene(canvas: HTMLCanvasElement, opts: Options): PipelineScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(C.fog, 14, 30);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const target = new THREE.Vector3(0, 1.45, 0);

  scene.add(new THREE.HemisphereLight(0xcfe3ff, 0x0a1628, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 8, 6);
  scene.add(key);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(d: T) => { disposables.push(d); return d; };

  // Floor grid gives depth; fog fades it out at the far edge.
  const grid = new THREE.GridHelper(40, 40, C.grid, C.grid);
  grid.position.y = -0.7;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  scene.add(grid);
  track(grid.geometry); track(grid.material as THREE.Material);

  // Main track through the five stages, with a gentle wave so it reads as a path, not a ruler.
  const stagePos = STAGE_X.map((x, i) => new THREE.Vector3(x, Math.sin(i * 1.3) * 0.18, Math.cos(i * 0.9) * 0.5 - 0.2));
  const mainCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-9.5, 0, 0.6), ...stagePos, new THREE.Vector3(9.5, 0, -0.4)]);
  const tubeMat = track(new THREE.MeshBasicMaterial({ color: C.track }));
  scene.add(new THREE.Mesh(track(new THREE.TubeGeometry(mainCurve, 240, 0.035, 8)), tubeMat));

  // Arc-length position of each stage on the track.
  const uOf = (p: THREE.Vector3) => {
    let best = 0, bestD = Infinity;
    for (let i = 0; i <= 600; i++) {
      const d = mainCurve.getPointAt(i / 600).distanceToSquared(p);
      if (d < bestD) { bestD = d; best = i / 600; }
    }
    return best;
  };
  const stageU = stagePos.map(uOf);
  const U_START = 0.02;
  const U_END = 0.985;

  const glow = track(glowTexture());
  const sprite = (color: number, scale: number) => {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glow, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
    s.scale.setScalar(scale);
    return s;
  };

  // Stage nodes: dim until the run reaches them, then passed (green) or failed (red).
  const nodeGeo = track(new RoundedBoxGeometry(0.95, 0.5, 0.5, 4, 0.12));
  const nodes = stagePos.map((p) => {
    const mat = track(new THREE.MeshStandardMaterial({ color: C.node, roughness: 0.45, metalness: 0.25, emissive: C.passed, emissiveIntensity: 0 }));
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.copy(p);
    const halo = sprite(C.passed, 2.2);
    halo.position.copy(p);
    scene.add(mesh, halo);
    return { mesh, mat, halo };
  });

  // The run: a bright head with a short fading trail.
  const runGeo = track(new THREE.SphereGeometry(0.075, 16, 12));
  const run = Array.from({ length: 5 }, (_, i) => {
    const mesh = new THREE.Mesh(runGeo, track(new THREE.MeshBasicMaterial({ color: C.run, transparent: true, opacity: 1 - i * 0.18 })));
    mesh.scale.setScalar(1 - i * 0.15);
    const halo = sprite(C.run, i === 0 ? 0.9 : 0.45);
    scene.add(mesh, halo);
    return { mesh, halo };
  });

  // Pilot's scan: a ring that sweeps over the failed stage.
  const scanMat = track(new THREE.MeshBasicMaterial({ color: C.run, transparent: true, opacity: 0 }));
  const scan = new THREE.Mesh(track(new THREE.TorusGeometry(0.52, 0.018, 8, 48)), scanMat);
  scan.rotation.y = Math.PI / 2;
  scene.add(scan);

  // The fix branch: leaves test, rises to the pull request, passes the approval gate, and comes back into test.
  const t0 = stagePos[TEST];
  const branchCurve = new THREE.CatmullRomCurve3([
    t0.clone().add(new THREE.Vector3(-0.2, 0.25, 0)),
    t0.clone().add(new THREE.Vector3(-1.4, 1.2, -0.6)),
    t0.clone().add(new THREE.Vector3(-0.9, 2.25, -1.0)),
    t0.clone().add(new THREE.Vector3(0.7, 2.45, -1.0)),
    t0.clone().add(new THREE.Vector3(1.6, 1.4, -0.6)),
    t0.clone().add(new THREE.Vector3(0.25, 0.25, 0)),
  ]);
  const BRANCH_SEG = 160;
  const branchGeo = track(new THREE.TubeGeometry(branchCurve, BRANCH_SEG, 0.03, 8));
  const branchMat = track(new THREE.MeshBasicMaterial({ color: C.pr, transparent: true, opacity: 0.9 }));
  scene.add(new THREE.Mesh(branchGeo, branchMat));
  const branchIndexCount = branchGeo.index!.count;
  const U_PR = 0.4;
  const U_GATE = 0.66;

  const pr = new THREE.Mesh(track(new RoundedBoxGeometry(0.7, 0.42, 0.42, 4, 0.1)),
    track(new THREE.MeshStandardMaterial({ color: C.node, roughness: 0.4, metalness: 0.25, emissive: C.pr, emissiveIntensity: 0.8 })));
  pr.position.copy(branchCurve.getPointAt(U_PR));
  const prHalo = sprite(C.pr, 1.8);
  prHalo.position.copy(pr.position);
  scene.add(pr, prHalo);

  const gateMat = track(new THREE.MeshBasicMaterial({ color: C.waiting, transparent: true }));
  const gate = new THREE.Mesh(track(new THREE.TorusGeometry(0.36, 0.045, 10, 48)), gateMat);
  gate.position.copy(branchCurve.getPointAt(U_GATE));
  const gateHalo = sprite(C.waiting, 1.7);
  gateHalo.position.copy(gate.position);
  scene.add(gate, gateHalo);

  const token = new THREE.Mesh(runGeo, track(new THREE.MeshBasicMaterial({ color: C.pr })));
  const tokenHalo = sprite(C.pr, 0.8);
  scene.add(token, tokenHalo);

  // Label anchors: just above each stage, the pull request and the gate.
  const anchors = [...stagePos.map((p) => p.clone().add(new THREE.Vector3(0, 0.55, 0))),
    pr.position.clone().add(new THREE.Vector3(-0.2, 0.5, 0)), gate.position.clone().add(new THREE.Vector3(0.9, 0.2, 0))];

  const tmp = new THREE.Vector3();
  const color = new THREE.Color();
  let width = 1, height = 1;
  let baseDistance = 15;

  function setFrame(t: number) {
    const fade = 1 - smooth(15.1, 15.9, t);

    // Where the run's head is on the track.
    let head: number;
    if (t < 3) head = lerp(U_START, stageU[TEST], smooth(0, 3, t));
    else if (t < 13) head = stageU[TEST];
    else head = lerp(stageU[TEST], U_END, smooth(13, 14.8, t));
    const runVisible = t < 14.8 ? fade : 0;
    run.forEach((p, i) => {
      const u = Math.max(U_START, head - i * 0.011);
      p.mesh.position.copy(mainCurve.getPointAt(u));
      p.halo.position.copy(p.mesh.position);
      const o = (u <= U_START && i > 0 ? 0 : 1) * runVisible;
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - i * 0.18) * o;
      p.halo.material.opacity = (i === 0 ? 0.9 : 0.35) * o;
    });

    // Stage status: passed once the run is past it; test fails until the fix comes back through.
    nodes.forEach((n, i) => {
      let status: "idle" | "passed" | "failed" = "idle";
      if (i < TEST && head >= stageU[i] - 0.002) status = "passed";
      if (i === TEST && t >= 3) status = t >= 13 ? "passed" : "failed";
      if (i === DEPLOY && t >= 14.2) status = "passed";
      const lit = status === "idle" ? 0 : fade;
      color.setHex(status === "failed" ? C.failed : C.passed);
      n.mat.emissive.copy(color);
      const pulse = status === "failed" && t < 7 ? 0.75 + 0.25 * Math.sin(t * 6) : 1;
      n.mat.emissiveIntensity = 0.75 * lit * pulse;
      n.halo.material.color.copy(color);
      n.halo.material.opacity = 0.32 * lit * pulse;
      const label = opts.labels[i];
      if (label) label.dataset.status = lit > 0.5 ? status : "idle";
    });

    // Pilot reads the log: the ring sweeps over the failed stage twice.
    const scanOn = smooth(4, 4.4, t) * (1 - smooth(6.6, 7, t));
    scan.position.copy(stagePos[TEST]);
    scan.position.x += Math.sin(((t - 4) / 3) * Math.PI * 3) * 0.55;
    scanMat.opacity = 0.85 * scanOn;
    scan.visible = scanOn > 0.01;

    // The branch grows to the pull request, waits at the gate, then returns once approved.
    let drawn: number;
    if (t < 7) drawn = 0;
    else if (t < 9) drawn = lerp(0, U_PR, smooth(7, 9, t));
    else if (t < 10) drawn = lerp(U_PR, U_GATE - 0.04, smooth(9, 10, t));
    else if (t < 12) drawn = U_GATE - 0.04;
    else drawn = lerp(U_GATE - 0.04, 1, smooth(12, 13, t));
    const segs = Math.floor(drawn * BRANCH_SEG);
    branchGeo.setDrawRange(0, Math.floor((segs / BRANCH_SEG) * branchIndexCount / 6) * 6);
    branchMat.opacity = 0.9 * fade;

    const prIn = smooth(8.6, 9.1, t) * fade;
    pr.scale.setScalar(Math.max(0.001, prIn));
    prHalo.material.opacity = 0.35 * prIn;

    const gateIn = smooth(9.6, 10.1, t) * fade;
    const approved = t >= 12;
    gateMat.color.setHex(approved ? C.passed : C.waiting);
    gateHalo.material.color.setHex(approved ? C.passed : C.waiting);
    const gatePulse = approved ? 1 : 0.7 + 0.3 * Math.sin(t * 5);
    gate.scale.setScalar(Math.max(0.001, gateIn * (approved ? 1 + 0.25 * (1 - smooth(12, 12.5, t)) : 1)));
    gateMat.opacity = gateIn;
    gateHalo.material.opacity = 0.4 * gateIn * gatePulse;
    gate.rotation.y = Math.sin(t * 0.8) * 0.35; // a slow sway shows it is a ring, never edge-on

    const tokenOn = t >= 7 && t < 13 ? 1 : 0;
    token.position.copy(branchCurve.getPointAt(clamp01(drawn)));
    tokenHalo.position.copy(token.position);
    token.visible = tokenOn > 0;
    tokenHalo.material.opacity = 0.8 * tokenOn;

    const prLabel = opts.labels[5];
    if (prLabel) prLabel.dataset.visible = String(prIn > 0.5);
    const gateLabel = opts.labels[6];
    if (gateLabel) {
      gateLabel.dataset.visible = String(gateIn > 0.5);
      gateLabel.dataset.status = approved ? "passed" : "waiting";
    }
  }

  function placeLabels() {
    camera.updateMatrixWorld();
    anchors.forEach((a, i) => {
      const el = opts.labels[i];
      if (!el) return;
      tmp.copy(a).project(camera);
      el.style.transform = `translate(${((tmp.x + 1) / 2) * width}px, ${((1 - tmp.y) / 2) * height}px) translate(-50%, -100%)`;
    });
  }

  function resize() {
    const parent = canvas.parentElement;
    width = parent?.clientWidth || 1;
    height = parent?.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole track (about ±8.5 units) in view on narrow screens.
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    baseDistance = Math.max(12.5, 8.2 / (Math.tan(halfFov) * camera.aspect));
    camera.updateProjectionMatrix();
  }

  const pointer = { x: 0, y: 0 };
  const cam = { x: 0, y: 0 };
  function placeCamera() {
    camera.position.set(cam.x * 1.6, 3.2 + cam.y * 0.8, baseDistance);
    camera.lookAt(target);
  }

  let time = opts.reducedMotion ? STORY[3].at + 1 : 0;
  let playing = !opts.reducedMotion;
  let visible = true;
  let raf = 0;
  let last = 0;
  let step = -1;

  function draw() {
    setFrame(time);
    placeCamera();
    renderer.render(scene, camera);
    placeLabels();
    const s = stepAt(time);
    if (s !== step) { step = s; opts.onStep(s); }
  }

  function loop(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    time = (time + dt) % STORY_LENGTH;
    cam.x = damp(cam.x, pointer.x, 2.5, dt);
    cam.y = damp(cam.y, pointer.y, 2.5, dt);
    draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (raf || !playing || !visible) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  const onPointer = (e: PointerEvent) => {
    if (opts.reducedMotion) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  const ro = new ResizeObserver(() => { resize(); if (!raf) draw(); });
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  draw();
  start();

  return {
    play() { playing = true; start(); },
    pause() { playing = false; stop(); },
    seek(s) { time = STORY[Math.max(0, Math.min(STORY.length - 1, s))].at + (opts.reducedMotion ? 1.5 : 0.01); draw(); },
    setVisible(v) { visible = v; if (v) start(); else stop(); },
    dispose() {
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
