/**
 * "Pilot", the sign-in robot. Plain Three.js, built from primitives (no model files to download).
 * Loaded on demand by RobotAgent; everything here is decorative.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { LoginMood } from "../../login-mood";

/** Sign-in moods plus two used by the AI Copilot. */
export type RobotMood = LoginMood | "curious" | "worried";

export interface RobotScene {
  setMood(mood: RobotMood, look?: number): void;
  wave(): void;
  dispose(): void;
}

interface Options {
  /** Hover and click on the robot itself. */
  onHover(hovering: boolean): void;
  onPoke(): void;
  reducedMotion: boolean;
}

const COLORS = {
  shell: 0xe6eef8,
  trim: 0x0369a1,
  visor: 0x07121f,
  eye: 0x7dd3fc,
  eyeError: 0xf87171,
  eyeHappy: 0x4ade80,
  eyeWorried: 0xfbbf24,
};

const damp = (from: number, to: number, rate: number, dt: number) => from + (to - from) * (1 - Math.exp(-rate * dt));

export function createRobotScene(canvas: HTMLCanvasElement, opts: Options): RobotScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0.35, 7.2);
  camera.lookAt(0, 0.25, 0);

  // Light: soft sky/ground fill, a warm key, and a blue rim that matches the page.
  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0a1628, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2.5, 4, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0x38bdf8, 18, 12);
  rim.position.set(-2.5, 1.5, -2);
  scene.add(rim);

  const owned: { dispose(): void }[] = [];
  const mat = <T extends THREE.Material>(m: T) => (owned.push(m), m);
  const geo = <T extends THREE.BufferGeometry>(g: T) => (owned.push(g), g);

  const shell = mat(new THREE.MeshStandardMaterial({ color: COLORS.shell, metalness: 0.25, roughness: 0.35 }));
  const trim = mat(new THREE.MeshStandardMaterial({ color: COLORS.trim, metalness: 0.4, roughness: 0.4 }));
  const visorMat = mat(new THREE.MeshStandardMaterial({ color: COLORS.visor, metalness: 0.6, roughness: 0.15 }));
  const eyeMat = mat(new THREE.MeshStandardMaterial({ color: COLORS.eye, emissive: COLORS.eye, emissiveIntensity: 2.2 }));
  const glowMat = mat(new THREE.MeshStandardMaterial({ color: COLORS.eye, emissive: COLORS.eye, emissiveIntensity: 1.6 }));

  const robot = new THREE.Group();
  scene.add(robot);

  // Body
  const torso = new THREE.Mesh(geo(new THREE.CapsuleGeometry(0.62, 0.55, 8, 24)), shell);
  torso.scale.set(1, 1, 0.82);
  torso.position.y = -0.55;
  robot.add(torso);
  const belt = new THREE.Mesh(geo(new THREE.TorusGeometry(0.6, 0.05, 12, 48)), trim);
  belt.rotation.x = Math.PI / 2;
  belt.scale.set(1, 0.82, 1);
  belt.position.y = -0.62;
  robot.add(belt);
  const chest = new THREE.Mesh(geo(new THREE.CircleGeometry(0.14, 32)), glowMat);
  chest.position.set(0, -0.32, 0.52);
  robot.add(chest);

  // Head (a group so it can turn independently)
  const head = new THREE.Group();
  head.position.y = 0.62;
  robot.add(head);
  head.add(new THREE.Mesh(geo(new RoundedBoxGeometry(1.35, 1.0, 1.0, 6, 0.32)), shell));
  const visor = new THREE.Mesh(geo(new RoundedBoxGeometry(1.08, 0.62, 0.2, 6, 0.12)), visorMat);
  visor.position.z = 0.45;
  head.add(visor);
  const eyes = new THREE.Group();
  eyes.position.z = 0.56;
  head.add(eyes);
  const eyeGeo = geo(new THREE.CapsuleGeometry(0.07, 0.12, 6, 16));
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.x = -0.24;
  eyeR.position.x = 0.24;
  eyes.add(eyeL, eyeR);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24)), trim);
    ear.rotation.z = Math.PI / 2;
    ear.position.x = side * 0.72;
    head.add(ear);
  }
  const antenna = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.025, 0.025, 0.32, 8)), trim);
  antenna.position.y = 0.66;
  head.add(antenna);
  const bulb = new THREE.Mesh(geo(new THREE.SphereGeometry(0.08, 16, 16)), glowMat);
  bulb.position.y = 0.86;
  head.add(bulb);

  // Arms: a shoulder pivot each. Robot arms telescope, which lets the hands reach the visor.
  interface Arm { shoulder: THREE.Group; upper: THREE.Mesh; hand: THREE.Mesh; extend: number }
  const arm = (side: -1 | 1): Arm => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.7, -0.25, 0);
    const upper = new THREE.Mesh(geo(new THREE.CapsuleGeometry(0.11, 0.42, 6, 16)), shell);
    const hand = new THREE.Mesh(geo(new THREE.SphereGeometry(0.15, 20, 20)), trim);
    shoulder.add(upper, hand);
    robot.add(shoulder);
    return { shoulder, upper, hand, extend: 1 };
  };
  const setExtend = (a: Arm, e: number) => {
    a.extend = e;
    a.upper.scale.y = e;
    a.upper.position.y = -0.3 * e;
    a.hand.position.y = -0.62 * e;
  };
  const armL = arm(-1);
  const armR = arm(1);
  setExtend(armL, 1);
  setExtend(armR, 1);

  // Soft floor shadow (radial gradient on a plane).
  const shadowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.45)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    owned.push(t);
    return t;
  })();
  const shadow = new THREE.Mesh(geo(new THREE.PlaneGeometry(2, 2)), mat(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.55;
  scene.add(shadow);

  // ---------------------------------------------------------------- behaviour
  let mood: RobotMood = "idle";
  let look = 0.5;
  let moodSince = 0;
  let waveUntil = 0;
  let hovering = false;
  const pointer = new THREE.Vector2(0, 0); // -1..1 relative to the canvas, clamped
  const eyeColor = new THREE.Color(COLORS.eye);
  const target = new THREE.Color(COLORS.eye);
  let nextBlink = 2;
  let blinkUntil = 0;

  const clock = new THREE.Clock();
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const hitsRobot = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObject(robot, true).length > 0;
  };

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 0.6, -1.4, 1.4),
      THREE.MathUtils.clamp(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 0.6, -1.2, 1.2),
    );
    const over = e.pointerType === "mouse" && hitsRobot(e.clientX, e.clientY);
    if (over !== hovering) {
      hovering = over;
      canvas.style.cursor = over ? "pointer" : "";
      opts.onHover(over);
    }
    kick();
  };
  const onClick = (e: MouseEvent) => {
    if (hitsRobot(e.clientX, e.clientY)) {
      api.wave();
      opts.onPoke();
    }
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("click", onClick);

  // Render loop. Runs while visible; with reduced motion it settles and then stops until something changes.
  let raf = 0;
  let running = false;
  let visible = true;
  let settleFrames = 0;
  const kick = () => {
    settleFrames = 90;
    if (!running && visible && !document.hidden) {
      running = true;
      clock.getDelta();
      raf = requestAnimationFrame(frame);
    }
  };

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const rate = opts.reducedMotion ? 30 : 7;
    const since = t - moodSince;

    // Where to look
    let yaw = pointer.x * 0.55;
    let pitch = pointer.y * 0.35;
    if (mood === "email") { yaw = 0.45 + (look - 0.5) * 0.5; pitch = 0.18; }
    if (mood === "password") { yaw = -0.15; pitch = 0.25; }
    if (mood === "peek") { yaw = 0.35; pitch = 0.2; }
    if (mood === "thinking") { yaw = Math.sin(t * 2) * 0.25; pitch = -0.15; }
    let roll = 0;
    if (mood === "curious") { roll = 0.22; pitch = Math.min(pitch, 0.05); }
    if (mood === "worried") { yaw *= 0.3; pitch = 0.3; roll = -0.08; }
    if (mood === "error" && !opts.reducedMotion) yaw = Math.sin(since * 22) * 0.35 * Math.max(0, 1 - since / 1.2);
    head.rotation.y = damp(head.rotation.y, yaw, rate, dt);
    head.rotation.x = damp(head.rotation.x, pitch, rate, dt);
    head.rotation.z = damp(head.rotation.z, roll, rate, dt);
    eyes.position.x = damp(eyes.position.x, yaw * 0.12, rate, dt);
    eyes.position.y = damp(eyes.position.y, -pitch * 0.1, rate, dt);
    robot.rotation.y = damp(robot.rotation.y, yaw * 0.25, rate * 0.6, dt);

    // Arms. Rotation z swings the arm sideways/up (left arm: + is inward), x brings the hand forward.
    // Rest: hands slightly out. Password: both hands over the visor. Peek: one hand. Wave: right arm up and out.
    const waving = t < waveUntil || (mood === "success" && since < 2.5); // celebrate, then settle
    let lz = -0.12, rz = 0.12, lx = 0, rx = 0, le = 1, re = 1;
    if (mood === "password") { lz = 2.75; rz = -2.75; lx = 0.7; rx = 0.7; le = 1.7; re = 1.7; }
    if (mood === "peek") { rz = -2.75; rx = 0.7; re = 1.7; }
    if (mood === "worried") { lz = 0.35; rz = -0.35; lx = 0.5; rx = 0.5; } // hands together in front
    if (mood === "curious") { rz = -2.3; rx = 0.9; re = 1.35; } // hand to the chin
    if (waving) { rz = 2.6 + (opts.reducedMotion ? 0 : Math.sin(t * 12) * 0.35); rx = 0; re = 1; }
    for (const [a, z, x, e] of [[armL, lz, lx, le], [armR, rz, rx, re]] as const) {
      a.shoulder.rotation.z = damp(a.shoulder.rotation.z, z, rate, dt);
      a.shoulder.rotation.x = damp(a.shoulder.rotation.x, x, rate, dt);
      setExtend(a, damp(a.extend, e, rate, dt));
    }

    // Float, hop on success, lean in when hovered
    const bob = opts.reducedMotion ? 0 : Math.sin(t * 1.6) * 0.06;
    const hop = mood === "success" && !opts.reducedMotion ? Math.abs(Math.sin(since * 7)) * 0.35 * Math.max(0, 1 - since / 1.6) : 0;
    robot.position.y = damp(robot.position.y, bob + hop, 12, dt);
    const s = hovering ? 1.04 : 1;
    robot.scale.setScalar(damp(robot.scale.x, s, 10, dt));
    shadow.scale.setScalar(1 - (robot.position.y + 0.06) * 0.6);

    // Eyes: colour by mood, blink, happy squint
    target.setHex(mood === "error" ? COLORS.eyeError : mood === "worried" ? COLORS.eyeWorried
      : mood === "success" || hovering ? COLORS.eyeHappy : COLORS.eye);
    eyeColor.lerp(target, 1 - Math.exp(-rate * dt));
    eyeMat.color.copy(eyeColor);
    eyeMat.emissive.copy(eyeColor);
    if (!opts.reducedMotion && t > nextBlink) { blinkUntil = t + 0.12; nextBlink = t + 2.5 + Math.random() * 3; }
    const squint = mood === "success" || hovering ? 0.45 : mood === "thinking" ? 0.7 : 1;
    const eyeY = t < blinkUntil ? 0.1 : squint;
    eyeL.scale.y = eyeR.scale.y = damp(eyeL.scale.y, eyeY, 30, dt);
    glowMat.emissiveIntensity = opts.reducedMotion ? 1.6 : 1.2 + Math.sin(t * 3) * 0.6;

    renderer.render(scene, camera);

    const ambient = !opts.reducedMotion; // bobbing and blinking never stop unless motion is reduced
    if (ambient || --settleFrames > 0) {
      raf = requestAnimationFrame(frame);
    } else {
      running = false;
    }
  }

  // Pause when the tab is hidden or the robot is scrolled away.
  const onVisibility = () => { if (document.hidden) stop(); else kick(); };
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); else stop(); });
  io.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  const stop = () => { cancelAnimationFrame(raf); running = false; };

  const api: RobotScene = {
    setMood(next, nextLook) {
      if (next !== mood) { mood = next; moodSince = clock.elapsedTime; }
      if (nextLook !== undefined) look = nextLook;
      kick();
    },
    wave() {
      waveUntil = clock.elapsedTime + 1.6;
      kick();
    },
    dispose() {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
      owned.forEach((o) => o.dispose());
      renderer.dispose();
    },
  };
  kick();
  return api;
}
