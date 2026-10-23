/**
 * The landing hero: a pipeline in 3D. Energy flows along the track as a run travels checkout → deploy; the test pod
 * fails with a jolt and a burst of sparks, Pilot scans it (PipelineHero draws the beam from the robot, using onFrame),
 * a glowing fix branch grows to a pull request, waits at a locked approval gate, unlocks, and a green wave carries the
 * run to deploy. Plain Three.js from primitives, loaded on demand. Every frame is a pure function of the story
 * time, so seeking and reduced motion are just `render(t)`.
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
  /** Every frame: story time and where the test pod is on the canvas (px), so the page can aim Pilot's scan at it. */
  onFrame?(t: number, pod: { x: number; y: number; r: number }): void;
  reducedMotion: boolean;
}

// The app's tokens: status colours mean status here too (passed, failed, waiting for approval).
const C = {
  track: 0x2c4466,
  node: 0x1b2a4a,
  run: 0x7dd3fc,
  pr: 0xa5b4fc,
  passed: 0x4ade80,
  failed: 0xf87171,
  spark: 0xfb923c,
  waiting: 0xfbbf24,
  fog: 0x0a1628,
  grid: 0x1e3252,
};

const STAGE_X = [-6, -3, 0, 3, 6];
const TEST = 3;
const DEPLOY = 4;
const T_FAIL = 3;
const T_APPROVED = 12;
const T_FIXED = 13;
const T_DEPLOYED = 14.2;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, t: number) => { const x = clamp01((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));
const frac = (v: number) => v - Math.floor(v);
/** 0 → 1 → 0 over [a, b]: for things that flash and fade. */
const blip = (a: number, b: number, t: number) => (t < a || t > b ? 0 : Math.sin(((t - a) / (b - a)) * Math.PI));

/** A small seeded random, so bursts look the same on every loop and every seek. */
function rng(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

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
  // A coloured light that sits on the test pod: red while it fails, green once it passes.
  const podLight = new THREE.PointLight(C.failed, 0, 4, 1.6);
  scene.add(podLight);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(d: T) => { disposables.push(d); return d; };
  const glow = track(glowTexture());
  const additive = { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false } as const;

  const sprite = (color: number, scale: number) => {
    const s = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glow, color, ...additive })));
    s.scale.setScalar(scale);
    return s;
  };
  /** A cloud of glowing points whose positions and colours are rewritten every frame. Intensity drives alpha too:
   * on the transparent canvas an additive point with colour but no alpha would still darken the page behind it. */
  const cloud = (count: number, size: number) => {
    const geo = track(new THREE.BufferGeometry());
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 4);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 4));
    const points = new THREE.Points(geo, track(new THREE.PointsMaterial({ size, map: glow, vertexColors: true, ...additive })));
    points.frustumCulled = false;
    scene.add(points);
    const color = new THREE.Color();
    return {
      set(i: number, p: THREE.Vector3, hex: number, intensity: number) {
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        color.setHex(hex);
        col[i * 4] = color.r; col[i * 4 + 1] = color.g; col[i * 4 + 2] = color.b; col[i * 4 + 3] = clamp01(intensity);
      },
      commit() { geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; },
    };
  };
  /** A flat ring that expands and fades: shockwaves for failure and success. */
  const shockwave = (color: number) => {
    const mat = track(new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, ...additive, opacity: 0 }));
    const mesh = new THREE.Mesh(track(new THREE.RingGeometry(0.42, 0.5, 64)), mat);
    scene.add(mesh);
    return {
      mesh,
      play(at: THREE.Vector3, start: number, t: number, reach = 3.2, length = 1) {
        const k = (t - start) / length;
        mesh.visible = k >= 0 && k <= 1;
        if (!mesh.visible) return;
        mesh.position.copy(at);
        mesh.scale.setScalar(1 + k * reach);
        mat.opacity = 0.8 * (1 - k) * (1 - k);
      },
    };
  };

  // A dark floor grid for depth, faint enough to sit under the starfield; fog fades it out at the far edge.
  const grid = new THREE.GridHelper(40, 40, C.grid, C.grid);
  grid.position.y = -0.7;
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.3;
  scene.add(grid);
  track(grid.geometry); track(grid.material as THREE.Material);

  // Main track through the five stages, with a gentle wave so it reads as a path, not a ruler. A soft outer sheath
  // makes it read as a conduit; the energy itself is the particle stream below.
  const stagePos = STAGE_X.map((x, i) => new THREE.Vector3(x, Math.sin(i * 1.3) * 0.18, Math.cos(i * 0.9) * 0.5 - 0.2));
  const mainCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-9.5, 0, 0.6), ...stagePos, new THREE.Vector3(9.5, 0, -0.4)]);
  scene.add(new THREE.Mesh(track(new THREE.TubeGeometry(mainCurve, 240, 0.03, 8)), track(new THREE.MeshBasicMaterial({ color: C.track }))));
  const sheathMat = track(new THREE.MeshBasicMaterial({ color: C.run, ...additive, opacity: 0.07 }));
  scene.add(new THREE.Mesh(track(new THREE.TubeGeometry(mainCurve, 240, 0.11, 10)), sheathMat));

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

  /** Where the run's head is on the track at story time t. */
  const headAt = (t: number) => {
    if (t < T_FAIL) return lerp(U_START, stageU[TEST], smooth(0, T_FAIL, t));
    if (t < T_FIXED) return stageU[TEST];
    return lerp(stageU[TEST], U_END, smooth(T_FIXED, 14.8, t));
  };
  // When the run reaches each stage, so each one can pulse as it passes.
  const passedAt = stagePos.map((_, i) => {
    if (i === TEST) return T_FIXED;
    if (i === DEPLOY) return T_DEPLOYED;
    for (let t = 0; t <= T_FAIL; t += 0.01) if (headAt(t) >= stageU[i] - 0.002) return t;
    return 0;
  });

  // Stage pods: a glassy shell with a core that spins while the run is inside, a progress bar that fills as it
  // arrives, and a ring of light that pulses out when the stage passes. Dim until the run reaches them.
  const podGeo = track(new RoundedBoxGeometry(0.95, 0.5, 0.5, 4, 0.12));
  const coreGeo = track(new THREE.IcosahedronGeometry(0.13, 0));
  const barGeo = track(new THREE.BoxGeometry(0.8, 0.035, 0.035));
  barGeo.translate(0.4, 0, 0); // grow from the left edge
  const nodes = stagePos.map((p) => {
    const mat = track(new THREE.MeshStandardMaterial({
      color: C.node, roughness: 0.15, metalness: 0.55, transparent: true, opacity: 0.62, emissive: C.passed, emissiveIntensity: 0,
    }));
    const mesh = new THREE.Mesh(podGeo, mat);
    mesh.position.copy(p);
    const coreMat = track(new THREE.MeshBasicMaterial({ color: C.run, wireframe: true, transparent: true, opacity: 0.5 }));
    const core = new THREE.Mesh(coreGeo, coreMat);
    mesh.add(core);
    const barTrack = new THREE.Mesh(barGeo, track(new THREE.MeshBasicMaterial({ color: C.track })));
    const barMat = track(new THREE.MeshBasicMaterial({ color: C.passed }));
    const bar = new THREE.Mesh(barGeo, barMat);
    barTrack.position.set(p.x - 0.4, p.y - 0.36, p.z + 0.22);
    bar.position.copy(barTrack.position).add(new THREE.Vector3(0, 0, 0.01));
    const halo = sprite(C.passed, 2.2);
    halo.position.copy(p);
    const pulse = shockwave(C.passed);
    scene.add(mesh, halo, barTrack, bar);
    return { mesh, mat, core, coreMat, bar, barMat, halo, pulse };
  });

  // Energy in the track: particles stream along behind the run; they crawl and redden while test is failing.
  const FLOW = 140;
  const flow = cloud(FLOW, 0.8);
  // How far the stream has travelled by time t: normal speed, a crawl during the failure, then a rush once fixed.
  const flowClock = (t: number) => (t < T_FAIL ? t : t < T_FIXED ? T_FAIL + (t - T_FAIL) * 0.18 : T_FAIL + 1.8 + (t - T_FIXED) * 1.6);

  // The run: a bright head with a short fading trail.
  const runGeo = track(new THREE.SphereGeometry(0.075, 16, 12));
  const run = Array.from({ length: 5 }, (_, i) => {
    const mesh = new THREE.Mesh(runGeo, track(new THREE.MeshBasicMaterial({ color: C.run, transparent: true, opacity: 1 - i * 0.18 })));
    mesh.scale.setScalar(1 - i * 0.15);
    const halo = sprite(C.run, i === 0 ? 0.9 : 0.45);
    scene.add(mesh, halo);
    return { mesh, halo };
  });
  // The green wave that carries the fixed run to deploy.
  const wave = sprite(C.passed, 2.6);
  scene.add(wave);

  // The failure: a red shockwave and a burst of sparks off the test pod.
  const failWave = shockwave(C.failed);
  const SPARKS = 46;
  const sparks = cloud(SPARKS, 0.6);
  const r1 = rng(7);
  const sparkVel = Array.from({ length: SPARKS }, () => {
    const a = r1() * Math.PI * 2, up = 0.4 + r1() * 1.1, speed = 1.2 + r1() * 2.2;
    return new THREE.Vector3(Math.cos(a) * speed, up * speed, Math.sin(a) * speed * 0.6);
  });

  // Pilot reads the log: a ring sweeps the failed pod while Pilot's beam (drawn over the canvas) is on it.
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
  const branchGeo = track(new THREE.TubeGeometry(branchCurve, BRANCH_SEG, 0.04, 8));
  const branchMat = track(new THREE.MeshBasicMaterial({ color: C.pr, transparent: true, opacity: 0.95 }));
  const branchGlowGeo = track(new THREE.TubeGeometry(branchCurve, BRANCH_SEG, 0.13, 10));
  const branchGlowMat = track(new THREE.MeshBasicMaterial({ color: C.pr, ...additive, opacity: 0.12 }));
  scene.add(new THREE.Mesh(branchGeo, branchMat), new THREE.Mesh(branchGlowGeo, branchGlowMat));
  const U_PR = 0.4;
  const U_GATE = 0.66;
  const BRANCH_FLOW = 16;
  const branchFlow = cloud(BRANCH_FLOW, 0.6);

  // The pull request: a small glowing card with a three-line diff on it.
  const pr = new THREE.Group();
  pr.add(new THREE.Mesh(track(new RoundedBoxGeometry(0.9, 0.56, 0.07, 3, 0.03)),
    track(new THREE.MeshStandardMaterial({ color: C.node, roughness: 0.35, metalness: 0.3, emissive: C.pr, emissiveIntensity: 0.45 }))));
  [[0.52, C.failed], [0.36, C.passed], [0.6, C.passed]].forEach(([w, c], i) => {
    const line = new THREE.Mesh(track(new THREE.BoxGeometry(w, 0.05, 0.01)), track(new THREE.MeshBasicMaterial({ color: c })));
    line.position.set(-0.32 + w / 2, 0.13 - i * 0.12, 0.045);
    pr.add(line);
  });
  pr.position.copy(branchCurve.getPointAt(U_PR));
  const prHalo = sprite(C.pr, 1.9);
  prHalo.position.copy(pr.position);
  scene.add(pr, prHalo);

  // The approval gate: a ring around a padlock that unlocks (shackle lifts and swings) once a teammate approves.
  const gateMat = track(new THREE.MeshBasicMaterial({ color: C.waiting, transparent: true }));
  const gate = new THREE.Group();
  gate.add(new THREE.Mesh(track(new THREE.TorusGeometry(0.4, 0.04, 10, 48)), gateMat));
  const lockBody = new THREE.Mesh(track(new RoundedBoxGeometry(0.24, 0.19, 0.1, 2, 0.03)), gateMat);
  lockBody.position.y = -0.05;
  const shackle = new THREE.Mesh(track(new THREE.TorusGeometry(0.075, 0.02, 8, 24, Math.PI)), gateMat);
  shackle.position.y = 0.045;
  gate.add(lockBody, shackle);
  gate.position.copy(branchCurve.getPointAt(U_GATE));
  const gateHalo = sprite(C.waiting, 1.8);
  gateHalo.position.copy(gate.position);
  const gateWave = shockwave(C.passed);
  scene.add(gate, gateHalo);

  const token = new THREE.Mesh(runGeo, track(new THREE.MeshBasicMaterial({ color: C.pr })));
  const tokenHalo = sprite(C.pr, 0.9);
  scene.add(token, tokenHalo);

  // Deploy celebrates: a burst of confetti in the status and accent colours.
  const CONFETTI = 80;
  const confetti = cloud(CONFETTI, 0.55);
  const r3 = rng(23);
  const confettiSeed = Array.from({ length: CONFETTI }, () => {
    const a = r3() * Math.PI * 2, speed = 1 + r3() * 2.4;
    return {
      v: new THREE.Vector3(Math.cos(a) * speed * 0.8, 2 + r3() * 2.6, Math.sin(a) * speed * 0.5),
      color: [C.passed, C.run, C.pr, C.waiting][Math.floor(r3() * 4)],
    };
  });

  // Label anchors: just above each stage, the pull request and the gate.
  const anchors = [...stagePos.map((p) => p.clone().add(new THREE.Vector3(0, 0.55, 0))),
    pr.position.clone().add(new THREE.Vector3(-0.2, 0.5, 0)), gate.position.clone().add(new THREE.Vector3(0.95, 0.2, 0))];

  const tmp = new THREE.Vector3();
  const color = new THREE.Color();
  const passedColor = new THREE.Color(C.passed);
  const podEdge = new THREE.Vector3(0.55, 0, 0);
  const GRAVITY = -3.2;
  let width = 1, height = 1;
  let baseDistance = 15;

  function setFrame(t: number) {
    const fade = 1 - smooth(15.1, 15.9, t);
    const head = headAt(t);
    const failing = t >= T_FAIL && t < T_FIXED;

    // The run's head and trail.
    const runVisible = t < 14.8 ? fade : 0;
    run.forEach((p, i) => {
      const u = Math.max(U_START, head - i * 0.011);
      p.mesh.position.copy(mainCurve.getPointAt(u));
      p.halo.position.copy(p.mesh.position);
      const o = (u <= U_START && i > 0 ? 0 : 1) * runVisible;
      (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(t >= T_FIXED ? C.passed : C.run);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - i * 0.18) * o;
      p.halo.material.color.setHex(t >= T_FIXED ? C.passed : C.run);
      p.halo.material.opacity = (i === 0 ? 0.9 : 0.35) * o;
    });
    const waveOn = smooth(T_FIXED, 13.3, t) * (1 - smooth(14.5, 14.9, t)) * fade;
    wave.position.copy(mainCurve.getPointAt(head));
    wave.material.opacity = 0.55 * waveOn;
    wave.visible = waveOn > 0.01;

    // The energy stream: only on track the run has already covered.
    const clock = flowClock(t);
    for (let k = 0; k < FLOW; k++) {
      const u = U_START + frac(k / FLOW + clock * 0.09) * (U_END - U_START);
      const shown = u <= head ? fade : 0;
      const nearFail = failing ? smooth(stageU[TEST] - 0.12, stageU[TEST], u) : 0;
      const hex = t >= T_FIXED ? C.passed : nearFail > 0.5 ? C.failed : C.run;
      const shimmer = 0.55 + 0.45 * Math.sin(k * 2.3 + t * 3);
      flow.set(k, mainCurve.getPointAt(u), hex, shown * shimmer * (failing ? 0.75 + nearFail * 0.5 : 1.1));
    }
    flow.commit();
    sheathMat.opacity = 0.07 * fade + 0.06 * waveOn;

    // Stage pods: status, the spinning core while the run is inside, progress, and a pulse as each one passes.
    nodes.forEach((n, i) => {
      let status: "idle" | "passed" | "failed" = "idle";
      if (i < TEST && head >= stageU[i] - 0.002) status = "passed";
      if (i === TEST && t >= T_FAIL) status = t >= T_FIXED ? "passed" : "failed";
      if (i === DEPLOY && t >= T_DEPLOYED) status = "passed";
      const lit = status === "idle" ? 0 : fade;
      const hex = status === "failed" ? C.failed : C.passed;
      n.mat.emissive.setHex(hex);
      const throb = status === "failed" ? 0.7 + 0.3 * Math.sin(t * (t < 7 ? 7 : 3)) : 1;
      n.mat.emissiveIntensity = 0.8 * lit * throb;
      n.halo.material.color.setHex(hex);
      n.halo.material.opacity = 0.34 * lit * throb;

      // Progress fills as the run approaches; test stays stuck where it failed until the fix lands.
      const approach = smooth(stageU[i] - 0.06, stageU[i], head);
      const fill = i === TEST ? (t >= T_FIXED ? 1 : approach * 0.7) : status === "passed" ? 1 : approach;
      n.bar.scale.x = Math.max(0.001, fill * fade);
      n.barMat.color.setHex(hex);

      // The core spins hard while the run is at the stage, idles otherwise, and goes red and jittery on failure.
      const busy = blip(stageU[i] - 0.07, stageU[i] + 0.02, head) + (i === TEST && failing ? 0.6 : 0);
      n.core.rotation.set(t * (0.6 + busy * 5), t * (0.9 + busy * 7), 0);
      n.core.scale.setScalar(1 + busy * 0.35);
      n.coreMat.color.setHex(status === "idle" ? C.run : hex);
      n.coreMat.opacity = (0.35 + 0.55 * Math.min(1, busy + lit * 0.4)) * fade;

      // Failure jolt: a sharp, decaying shake.
      const shake = i === TEST ? Math.exp(-(t - T_FAIL) * 5) * (t >= T_FAIL ? 1 : 0) : 0;
      n.mesh.position.copy(stagePos[i]);
      n.mesh.position.x += Math.sin(t * 70) * 0.09 * shake;
      n.mesh.position.y += Math.cos(t * 55) * 0.05 * shake;
      n.halo.position.copy(n.mesh.position);
      n.pulse.play(stagePos[i], passedAt[i], t, i === DEPLOY ? 4.2 : 2.6, i === DEPLOY ? 1.2 : 0.8);

      const label = opts.labels[i];
      if (label) label.dataset.status = lit > 0.5 ? status : "idle";
    });

    // The failure itself.
    failWave.play(stagePos[TEST], T_FAIL, t, 3.4, 1);
    for (let k = 0; k < SPARKS; k++) {
      const dt = t - T_FAIL;
      const on = dt >= 0 && dt <= 1.3 ? 1 - dt / 1.3 : 0;
      tmp.copy(stagePos[TEST]).addScaledVector(sparkVel[k], Math.max(0, dt));
      tmp.y += 0.5 * GRAVITY * dt * dt;
      sparks.set(k, tmp, k % 3 ? C.spark : C.failed, on * 1.2);
    }
    sparks.commit();
    podLight.position.copy(stagePos[TEST]).add(new THREE.Vector3(0, 0.6, 0.8));
    podLight.color.setHex(t >= T_FIXED ? C.passed : C.failed);
    podLight.intensity = (failing ? 2.2 * (0.7 + 0.3 * Math.sin(t * 6)) : 3 * blip(T_FIXED, 14, t)) * fade;

    // Pilot reads the log: a ring sweeps the pod under the beam.
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
    else if (t < T_APPROVED) drawn = U_GATE - 0.04;
    else drawn = lerp(U_GATE - 0.04, 1, smooth(T_APPROVED, T_FIXED, t));
    const segs = Math.floor(drawn * BRANCH_SEG);
    branchGeo.setDrawRange(0, Math.floor((segs / BRANCH_SEG) * branchGeo.index!.count / 6) * 6);
    branchGlowGeo.setDrawRange(0, Math.floor((segs / BRANCH_SEG) * branchGlowGeo.index!.count / 6) * 6);
    branchMat.opacity = 0.95 * fade;
    branchGlowMat.opacity = 0.12 * fade;
    for (let k = 0; k < BRANCH_FLOW; k++) {
      const u = frac(k / BRANCH_FLOW + t * 0.3) * drawn;
      branchFlow.set(k, branchCurve.getPointAt(clamp01(u)), C.pr, (drawn > 0.02 ? 0.9 : 0) * fade);
    }
    branchFlow.commit();

    const prIn = smooth(8.6, 9.1, t) * fade;
    pr.scale.setScalar(Math.max(0.001, prIn * (1 + 0.12 * blip(8.6, 9.3, t))));
    pr.rotation.y = -0.25 + Math.sin(t * 0.7) * 0.12;
    pr.position.y = branchCurve.getPointAt(U_PR).y + Math.sin(t * 1.6) * 0.04;
    prHalo.material.opacity = 0.38 * prIn;

    const gateIn = smooth(9.6, 10.1, t) * fade;
    const approved = t >= T_APPROVED;
    const unlock = smooth(T_APPROVED, 12.4, t);
    color.setHex(C.waiting).lerp(passedColor, unlock);
    gateMat.color.copy(color);
    gateHalo.material.color.copy(color);
    const gatePulse = approved ? 1 : 0.7 + 0.3 * Math.sin(t * 5);
    gate.scale.setScalar(Math.max(0.001, gateIn * (1 + 0.25 * blip(T_APPROVED, 12.5, t))));
    gateMat.opacity = gateIn;
    gateHalo.material.opacity = 0.45 * gateIn * gatePulse;
    gate.rotation.y = Math.sin(t * 0.8) * 0.35; // a slow sway shows it is a ring, never edge-on
    shackle.position.y = 0.045 + unlock * 0.07;
    shackle.rotation.y = unlock * Math.PI * 0.6;
    gateWave.play(gate.position, T_APPROVED, t, 2.4, 0.8);

    const tokenOn = t >= 7 && t < T_FIXED ? fade : 0;
    token.position.copy(branchCurve.getPointAt(clamp01(drawn)));
    tokenHalo.position.copy(token.position);
    token.visible = tokenOn > 0;
    tokenHalo.material.opacity = 0.8 * tokenOn;

    // Deploy: confetti.
    for (let k = 0; k < CONFETTI; k++) {
      const s = confettiSeed[k];
      const dt = t - T_DEPLOYED;
      const on = dt >= 0 && dt <= 1.6 ? 1 - dt / 1.6 : 0;
      tmp.copy(stagePos[DEPLOY]).addScaledVector(s.v, Math.max(0, dt));
      tmp.y += 0.5 * GRAVITY * dt * dt;
      confetti.set(k, tmp, s.color, on * (0.7 + 0.3 * Math.sin(k + t * 20)));
    }
    confetti.commit();

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
    baseDistance = Math.max(11, 8.2 / (Math.tan(halfFov) * camera.aspect));
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
    if (opts.onFrame) {
      tmp.copy(stagePos[TEST]).project(camera);
      const x = ((tmp.x + 1) / 2) * width, y = ((1 - tmp.y) / 2) * height;
      tmp.copy(stagePos[TEST]).add(podEdge).project(camera);
      opts.onFrame(time, { x, y, r: Math.abs(((tmp.x + 1) / 2) * width - x) });
    }
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
