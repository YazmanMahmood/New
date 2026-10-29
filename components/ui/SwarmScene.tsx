"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createInterceptAct, INTERCEPT_DURATION } from "./interceptAct";

/*
  Experimental hero scene. A valley at dusk, drawn like a survey map (contour
  lines and a faint grid over shaded ground). Twelve quadcopters spin up on a
  pad near the horizon, lift off one after another, form a V and fly down the
  valley toward the viewer, following the terrain, then the loop restarts.

  Flight is simulated with springs, so the drones accelerate smoothly and tilt
  into their speed and turns like real multirotors. Colours for the sky, map
  lines and pad come from the page's CSS variables, so the scene follows the
  mission mode. It only renders while on screen, and holds one still frame for
  reduced-motion visitors.
*/

const DRONES = 12;
const CYCLE = 15; // seconds per take-off → fly-past, for one drone
// The scene plays two acts on a loop: the swarm flies once (the last drone
// leaves about 3 s after the first), then the intercept (interceptAct.ts)
const SWARM_DURATION = 18;
const TOTAL = SWARM_DURATION + INTERCEPT_DURATION;
const CRUISE = 8; // height above the ground while flying
const SPEED = 7; // forward speed, units per second
const PAD = new THREE.Vector3(0, 0, -20);
const CAMERA = new THREE.Vector3(0, 9, 24);

// ---------------------------------------------------------------- terrain

/** Smooth 2D value noise in [0, 1]. */
function noise(x: number, z: number) {
  const hash = (i: number, j: number) => {
    const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Five octaves of noise: big ridges with smaller detail on top. */
function fbm(x: number, z: number) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i++) {
    sum += noise(x * freq, z * freq) * amp;
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

/** Ground height: hills on both sides of a valley, flat around the pad and the camera. */
function ground(x: number, z: number) {
  const hills = (fbm(x * 0.028 + 3.1, z * 0.028 + 7.7) - 0.35) * 26;
  const valley = THREE.MathUtils.smoothstep(Math.abs(x + Math.sin(z * 0.03) * 6), 5, 34);
  const floor = (fbm(x * 0.09, z * 0.09) - 0.5) * 1.6;
  let h = floor + Math.max(0, hills) * valley;
  h *= THREE.MathUtils.smoothstep(Math.hypot(x - PAD.x, z - PAD.z), 7, 16);
  h *= THREE.MathUtils.smoothstep(Math.hypot(x - CAMERA.x, z - CAMERA.z), 8, 30);
  return h;
}

// ---------------------------------------------------------------- drone model

const SHELL = new THREE.MeshStandardMaterial({ color: 0xd9dbde, roughness: 0.45, metalness: 0.1 });
const FRAME = new THREE.MeshStandardMaterial({ color: 0x1c1e21, roughness: 0.55, metalness: 0.35 });
const BLADE = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
const BLUR = new THREE.MeshBasicMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
const ARM_ENDS: [number, number][] = [[0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]];

/** Soft round glow used for the navigation lights. */
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

/** Static body (one merged mesh per material), shared by every drone. Forward is +z. */
function droneBody() {
  const shell: THREE.BufferGeometry[] = [];
  const frame: THREE.BufferGeometry[] = [];

  const hull = new THREE.CapsuleGeometry(0.13, 0.3, 6, 12);
  hull.rotateX(Math.PI / 2);
  hull.scale(1, 0.62, 1);
  shell.push(hull);
  frame.push(new THREE.BoxGeometry(0.16, 0.06, 0.22).translate(0, 0.085, -0.02)); // battery

  for (const [x, z] of ARM_ENDS) {
    const len = Math.hypot(x, z);
    const arm = new THREE.CylinderGeometry(0.018, 0.022, len, 8);
    arm.rotateZ(Math.PI / 2);
    arm.rotateY(-Math.atan2(z, x));
    arm.translate(x / 2, 0.01, z / 2);
    frame.push(arm);
    frame.push(new THREE.CylinderGeometry(0.036, 0.036, 0.06, 12).translate(x, 0.035, z)); // motor
  }
  for (const side of [-1, 1]) {
    for (const end of [-1, 1]) {
      frame.push(new THREE.CylinderGeometry(0.011, 0.011, 0.16, 6).translate(side * 0.12, -0.13, end * 0.1)); // leg
    }
    const skid = new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6);
    skid.rotateX(Math.PI / 2);
    frame.push(skid.translate(side * 0.12, -0.21, 0));
  }
  frame.push(new THREE.SphereGeometry(0.05, 12, 10).translate(0, -0.1, 0.17)); // camera gimbal

  return { shell: mergeGeometries(shell)!, frame: mergeGeometries(frame)! };
}

type Drone = {
  group: THREE.Group;
  props: { group: THREE.Group; blades: THREE.Mesh; disc: THREE.Mesh; dir: number }[];
  strobe: THREE.Sprite;
  start: THREE.Vector3;
  slot: THREE.Vector3;
  delay: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  yaw: number;
  rpm: number;
  lastT: number;
};

// ---------------------------------------------------------------- scene

export default function SwarmScene({ className = "", still = false }: { className?: string; still?: boolean }) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the hero keeps its plain background
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
    el.append(renderer.domElement);

    const scene = new THREE.Scene();
    const fog = new THREE.Fog(0x0a0a0a, 50, 150);
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);

    // Low sun from the left, green-tinted sky fill to match the globe below
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.1);
    sun.castShadow = true;
    // Phones get a smaller shadow map and a coarser terrain mesh
    const small = el.clientWidth < 768;
    sun.shadow.mapSize.setScalar(small ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 28, bottom: -28, near: 1, far: 160 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
    scene.add(sun, sun.target);
    scene.add(new THREE.HemisphereLight(0xa8f0c8, 0x1e3a2a, 1.25));

    // Sky dome: page background overhead, a green glow along the horizon
    const skyUniforms = { top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() } };
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(300, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: skyUniforms,
        vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader:
          "uniform vec3 top; uniform vec3 horizon; varying vec3 vDir; void main(){ float t = smoothstep(-0.02, 0.35, vDir.y); gl_FragColor = vec4(mix(horizon, top, t), 1.0); }",
      }),
    );
    scene.add(sky);

    // Terrain, coloured by height and slope in the signal-green palette
    const terrainGeo = new THREE.PlaneGeometry(260, 200, small ? 140 : 220, small ? 110 : 170);
    terrainGeo.rotateX(-Math.PI / 2);
    terrainGeo.translate(0, 0, -40);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, ground(pos.getX(i), pos.getZ(i)));
    terrainGeo.computeVertexNormals();
    const normals = terrainGeo.attributes.normal;
    const colours = new Float32Array(pos.count * 3);
    const sand = new THREE.Color(0x3d6b4f);
    const scrub = new THREE.Color(0x2e7d55);
    const rock = new THREE.Color(0x6f9a84);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const h = pos.getY(i);
      const slope = 1 - normals.getY(i);
      c.copy(sand).lerp(scrub, THREE.MathUtils.smoothstep(h, 1, 6));
      c.lerp(rock, THREE.MathUtils.clamp(THREE.MathUtils.smoothstep(h, 7, 16) + slope * 1.6, 0, 1));
      c.multiplyScalar(0.85 + noise(pos.getX(i) * 0.6, pos.getZ(i) * 0.6) * 0.3);
      c.toArray(colours, i * 3);
    }
    terrainGeo.setAttribute("color", new THREE.BufferAttribute(colours, 3));

    // Map overlay drawn in the shader: contour lines every 1.5 units of height, grid every 10
    const mapUniforms = { lineColor: { value: new THREE.Color(0xffffff) } };
    const terrainMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0 });
    terrainMat.onBeforeCompile = (shader) => {
      shader.uniforms.lineColor = mapUniforms.lineColor;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vMapPos;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvMapPos = position;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vMapPos;\nuniform vec3 lineColor;")
        .replace(
          "#include <tonemapping_fragment>",
          `{
            float h = vMapPos.y / 1.5;
            float contour = 1.0 - min(abs(fract(h - 0.5) - 0.5) / max(fwidth(h), 1e-4), 1.0);
            vec2 g = vMapPos.xz / 10.0;
            vec2 gd = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-4));
            float grid = 1.0 - min(min(gd.x, gd.y), 1.0);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, lineColor, contour * 0.22 + grid * 0.07);
          }
          #include <tonemapping_fragment>`,
        );
    };
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Launch pad: concrete slab, a slot marking per drone, accent edge ring and corner beacons
    const padY = ground(PAD.x, PAD.z);
    const concrete = new THREE.MeshStandardMaterial({ color: 0x55555a, roughness: 0.9 });
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.2, 48), concrete);
    slab.position.set(PAD.x, padY + 0.05, PAD.z);
    slab.receiveShadow = true;
    const accentMat = new THREE.MeshBasicMaterial({ color: 0xd7263d, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(4.35, 4.55, 64), accentMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(PAD.x, padY + 0.16, PAD.z);
    const markMat = new THREE.MeshBasicMaterial({ color: 0xbfbfbf, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    scene.add(slab, ring);
    const markGeo = new THREE.RingGeometry(0.5, 0.56, 4, 1, Math.PI / 4).rotateX(-Math.PI / 2);
    for (let i = 0; i < DRONES; i++) {
      const mark = new THREE.Mesh(markGeo, markMat);
      mark.position.set(PAD.x + ((i % 4) - 1.5) * 1.6, padY + 0.16, PAD.z + (Math.floor(i / 4) - 1) * 1.6);
      scene.add(mark);
    }

    const glow = glowTexture();
    const sprite = (color: number, size: number) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      s.scale.setScalar(size);
      return s;
    };
    const beaconMat = new THREE.SpriteMaterial({ map: glow, color: 0xd7263d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const beacons = [0, 1, 2, 3].map((i) => {
      const b = new THREE.Sprite(beaconMat);
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      b.position.set(PAD.x + Math.cos(a) * 4.45, padY + 0.3, PAD.z + Math.sin(a) * 4.45);
      b.scale.setScalar(0.9);
      scene.add(b);
      return b;
    });

    // Drones
    const body = droneBody();
    const bladeGeo = new THREE.BoxGeometry(0.38, 0.006, 0.034);
    const discGeo = new THREE.CircleGeometry(0.2, 24).rotateX(-Math.PI / 2);
    const drones: Drone[] = Array.from({ length: DRONES }, (_, i) => {
      const group = new THREE.Group();
      group.rotation.order = "YXZ";
      for (const [geo, mat] of [[body.shell, SHELL], [body.frame, FRAME]] as const) {
        const m = new THREE.Mesh(geo, mat);
        m.castShadow = true;
        group.add(m);
      }
      const props = ARM_ENDS.map(([x, z], j) => {
        const pg = new THREE.Group();
        pg.position.set(x, 0.075, z);
        const blades = new THREE.Mesh(bladeGeo, BLADE);
        blades.castShadow = true;
        const disc = new THREE.Mesh(discGeo, BLUR);
        disc.visible = false;
        pg.add(blades, disc);
        group.add(pg);
        // Diagonal pairs spin the same way, like a real quad
        return { group: pg, blades, disc, dir: j === 0 || j === 3 ? 1 : -1 };
      });
      // Navigation lights: red on the left, green on the right, white strobe at the back
      const red = sprite(0xff2a2a, 0.32);
      red.position.set(0.3, 0.02, 0.3);
      const green = sprite(0x2aff6a, 0.32);
      green.position.set(-0.3, 0.02, 0.3);
      const strobe = sprite(0xffffff, 0.9);
      strobe.position.set(0, 0.06, -0.2);
      group.add(red, green, strobe);
      scene.add(group);

      const start = new THREE.Vector3(((i % 4) - 1.5) * 1.6, 0, (Math.floor(i / 4) - 1) * 1.6);
      const rank = Math.ceil(i / 2); // 0 leads, then pairs fan out behind
      const side = i === 0 ? 0 : i % 2 ? -1 : 1;
      const slot = new THREE.Vector3(side * rank * 2.1, rank * 0.25, -rank * 2.1);
      return { group, props, strobe, start, slot, delay: i * 0.28, pos: new THREE.Vector3(), vel: new THREE.Vector3(), yaw: 0, rpm: 0, lastT: Infinity };
    });

    // Second act: hostile VTOL, detection and interceptor chase
    const act = createInterceptAct({ scene, ground, pad: PAD, padY, glow });
    let actRunning = false;

    // Colours follow the page: background, text and accent from CSS variables
    const applyColours = () => {
      const css = getComputedStyle(el);
      const read = (name: string, fallback: string) => {
        try {
          return new THREE.Color(css.getPropertyValue(name).trim() || fallback);
        } catch {
          return new THREE.Color(fallback);
        }
      };
      const bg = read("--bg", "#0a0a0a");
      const green = read("--signal", "#2bb673");
      fog.color.copy(bg).lerp(green, 0.14);
      skyUniforms.top.value.copy(bg);
      skyUniforms.horizon.value.copy(bg).lerp(green, 0.3);
      mapUniforms.lineColor.value.copy(green).lerp(read("--fg", "#ffffff"), 0.35);
      const accent = read("--accent", "#d7263d");
      accentMat.color.copy(accent);
      beaconMat.color.copy(accent);
      act.setAccent(accent);
    };
    applyColours();
    const modeWatch = new MutationObserver(() => requestAnimationFrame(applyColours));
    modeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < 1 ? 66 : 48; // wider on tall phone screens
      camera.updateProjectionMatrix();
    };
    resize();
    const sizeWatch = new ResizeObserver(resize);
    sizeWatch.observe(el);

    // ------------------------------------------------------------ simulation

    const target = new THREE.Vector3();
    const accel = new THREE.Vector3();
    const centre = new THREE.Vector3();
    // On wide screens, aim left of the pad so the action sits on the right, clear of the hero text
    const AIM_X = -9;
    const look = new THREE.Vector3(AIM_X, -5.5, -20);

    /** Where the flight plan wants a drone at time t into its loop, and whether its motors run. */
    const plan = (d: Drone, t: number) => {
      const padTop = padY + 0.38;
      if (t < 1.6) {
        target.copy(d.start).add(PAD).setY(padTop);
        return t > 0.6;
      }
      if (t < 5.2) {
        // Climb while sliding from the pad grid into the V
        const k = THREE.MathUtils.smootherstep(t, 1.6, 5.2);
        target.copy(d.start).lerp(d.slot, k).add(PAD);
        target.y = padTop + (CRUISE + d.slot.y) * THREE.MathUtils.smoothstep(t, 1.6, 4.4);
        return true;
      }
      const fly = t - 5.2;
      const ramp = THREE.MathUtils.smoothstep(fly, 0, 2.5);
      const lx = Math.sin(fly * 0.32) * 4.5 * ramp;
      const lz = PAD.z + fly * SPEED * (0.4 + 0.6 * ramp);
      target.set(lx + d.slot.x, 0, lz + d.slot.z);
      // Follow the terrain, but look ahead so they climb before a ridge, not into it
      const ahead = Math.max(ground(target.x, target.z), ground(target.x, target.z + 6));
      target.y = Math.max(ahead, padY) + CRUISE + d.slot.y;
      return true;
    };

    const step = (time: number, dt: number) => {
      centre.set(0, 0, 0);
      let flying = 0;
      const ts = time % TOTAL;
      const swarmAct = ts < SWARM_DURATION;
      for (const d of drones) {
        // Swarm act: each drone runs its flight once, then waits out of shot.
        // Intercept act: parked on the pad (t = 0 sends it back there).
        const t = swarmAct ? THREE.MathUtils.clamp(ts - d.delay, 0, CYCLE - 0.01) : 0;
        const motors = plan(d, t);
        if (t < d.lastT) {
          // New loop: back on the pad, at rest
          d.pos.copy(target);
          d.vel.set(0, 0, 0);
          d.yaw = 0;
          d.rpm = 0;
        }
        d.lastT = t;

        // Critically damped spring toward the plan; a little hover drift once airborne
        const airborne = d.pos.y - padY > 0.6;
        if (airborne) {
          target.x += Math.sin(time * 1.3 + d.delay * 9) * 0.08;
          target.y += Math.sin(time * 1.7 + d.delay * 5) * 0.06;
        }
        const k = 7;
        accel.copy(target).sub(d.pos).multiplyScalar(k).addScaledVector(d.vel, -2 * Math.sqrt(k));
        d.vel.addScaledVector(accel, dt);
        d.pos.addScaledVector(d.vel, dt);

        // Face the direction of travel, then tilt into speed and acceleration
        const speed = Math.hypot(d.vel.x, d.vel.z);
        if (speed > 1.5) {
          const want = Math.atan2(d.vel.x, d.vel.z);
          d.yaw += (want - d.yaw) * Math.min(1, dt * 2);
        }
        const fx = Math.sin(d.yaw);
        const fz = Math.cos(d.yaw);
        const fwd = d.vel.x * fx + d.vel.z * fz + (accel.x * fx + accel.z * fz) * 0.25;
        const side = d.vel.x * fz - d.vel.z * fx + (accel.x * fz - accel.z * fx) * 0.25;
        d.group.position.copy(d.pos);
        d.group.rotation.set(THREE.MathUtils.clamp(fwd * 0.035, -0.45, 0.45), d.yaw, THREE.MathUtils.clamp(side * 0.035, -0.4, 0.4));

        // Props spin up before lift-off; at speed the blades become a blur disc
        d.rpm += ((motors ? 1 : 0) - d.rpm) * Math.min(1, dt * 1.8);
        for (const p of d.props) {
          p.group.rotation.y += p.dir * d.rpm * 60 * dt;
          p.blades.visible = d.rpm < 0.55;
          p.disc.visible = d.rpm > 0.3;
        }
        d.strobe.visible = motors && (time + d.delay * 3) % 1.3 < 0.07;

        // Out of shot behind the camera: hide until the next loop
        d.group.visible = d.pos.z < CAMERA.z - 1;
        if (d.group.visible && airborne) {
          centre.add(d.pos);
          flying++;
        }
      }

      // Intercept act
      let alert = false;
      if (!swarmAct) {
        if (!actRunning) {
          act.reset();
          actRunning = true;
        }
        const r = act.update(ts - SWARM_DURATION, dt);
        alert = r.alert;
        centre.copy(r.focus);
      } else if (actRunning) {
        act.idle();
        actRunning = false;
      }

      // Beacons pulse slowly, and fast while a threat is being tracked
      const pulse = 0.6 + Math.sin(time * (alert ? 14 : 3)) * 0.4;
      beacons.forEach((b) => b.scale.setScalar(0.5 + pulse * (alert ? 0.9 : 0.6)));

      // Sun and its shadow box follow the action (or the pad before take-off)
      if (!swarmAct) flying = 1;
      else if (flying) centre.divideScalar(flying);
      else centre.copy(PAD);
      sun.target.position.copy(centre);
      sun.position.copy(centre).add(new THREE.Vector3(-55, 32, -30));

      // Camera: slow handheld drift, easing its aim toward the swarm
      camera.position.set(CAMERA.x + Math.sin(time * 0.11) * 1.4, CAMERA.y + Math.sin(time * 0.17) * 0.25, CAMERA.z);
      const aimX = THREE.MathUtils.clamp((camera.aspect < 1 ? 0 : AIM_X) + (flying ? centre.x * 0.35 : 0), -16, 14);
      look.x += (aimX - look.x) * Math.min(1, dt * 0.8);
      camera.lookAt(look);
    };

    // ------------------------------------------------------------ loop

    let frame = 0;
    let running = false;
    let time = 0;
    let last = 0;
    const loop = () => {
      const now = performance.now();
      const dt = THREE.MathUtils.clamp((now - last) / 1000, 0, 1 / 20);
      last = now;
      time += dt;
      step(time, dt);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    let visible: IntersectionObserver | null = null;
    if (still) {
      // Run the simulation forward to mid-flight, then draw that one frame
      for (time = 0; time < 9.5; time += 1 / 60) step(time, 1 / 60);
      renderer.render(scene, camera);
    } else {
      visible = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
      visible.observe(el);
    }

    return () => {
      stop();
      visible?.disconnect();
      sizeWatch.disconnect();
      modeWatch.disconnect();
      const materials = new Set<THREE.Material>();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh || o instanceof THREE.Sprite) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m));
        }
      });
      materials.forEach((m) => m.dispose());
      [body.shell, body.frame, bladeGeo, discGeo].forEach((g) => g.dispose());
      glow.dispose();
      act.dispose();
      markMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [still]);

  return <div ref={holder} aria-hidden className={className} />;
}
