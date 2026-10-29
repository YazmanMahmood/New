import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
  Second act of the hero scene (components/ui/SwarmScene.tsx): a hostile
  fixed-wing VTOL drone crosses the valley. Radar pings sweep out from the
  pad, a reticle acquires and locks the target, and an interceptor spins up,
  launches and chases it down with lead pursuit. Impact flash, debris, and
  the wreck falls to the ground.

  Timeline, in seconds into the act (tc):
    0     VTOL enters, far right
    1.8   two radar pings from the pad
    3.0   reticle acquiring (spinning, blinking)
    4.2   locked: tracking line on, VTOL starts evading
    4.4   interceptor spins up, launches at 4.8, pursues from 5.5
    ~8    impact
*/

export const INTERCEPT_DURATION = 13;

type Ctx = {
  scene: THREE.Scene;
  ground: (x: number, z: number) => number;
  pad: THREE.Vector3;
  padY: number;
  glow: THREE.Texture;
};

const VTOL_SPEED = 10;
const VTOL_ALT = 4.5; // low, terrain-hugging, the way an intruder tries to stay under radar
const VTOL_START = new THREE.Vector3(70, 0, -75);
const VTOL_HEADING = Math.atan2(-110, 80); // across the valley, toward the near left
const MAX_CHASE_SPEED = 28;
const DEBRIS = 16;
const TRAIL = 70;

/** A line that remembers the last few positions of whatever it follows. */
function makeTrail(color: number, opacity: number) {
  const positions = new Float32Array(TRAIL * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
  line.frustumCulled = false;
  let count = 0;
  return {
    line,
    clear() {
      count = 0;
      geo.setDrawRange(0, 0);
    },
    push(p: THREE.Vector3) {
      positions.copyWithin(3, 0, (TRAIL - 1) * 3);
      positions[0] = p.x;
      positions[1] = p.y;
      positions[2] = p.z;
      count = Math.min(TRAIL, count + 1);
      geo.setDrawRange(0, count);
      geo.attributes.position.needsUpdate = true;
    },
  };
}

/** Four corner brackets and a centre dot, drawn white so the sprite colour tints it. */
function reticleTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.strokeStyle = "#fff";
  g.lineWidth = 7;
  const m = 10;
  const l = 34;
  for (const [x, y, dx, dy] of [[m, m, 1, 1], [128 - m, m, -1, 1], [m, 128 - m, 1, -1], [128 - m, 128 - m, -1, -1]]) {
    g.beginPath();
    g.moveTo(x, y + dy * l);
    g.lineTo(x, y);
    g.lineTo(x + dx * l, y);
    g.stroke();
  }
  g.fillStyle = "#fff";
  g.fillRect(60, 60, 8, 8);
  return new THREE.CanvasTexture(c);
}

/** Hostile fixed-wing VTOL: fuselage, wing, twin booms with lift rotors, twin tail, pusher prop. Forward is +z. */
function makeVtol(glow: THREE.Texture) {
  const hull: THREE.BufferGeometry[] = [];
  const dark: THREE.BufferGeometry[] = [];
  const fuselage = new THREE.CapsuleGeometry(0.14, 1.3, 6, 12);
  fuselage.rotateX(Math.PI / 2);
  hull.push(fuselage);
  hull.push(new THREE.BoxGeometry(3.4, 0.035, 0.4).translate(0, 0.05, 0.15)); // wing
  hull.push(new THREE.BoxGeometry(1.6, 0.03, 0.22).translate(0, 0.34, -1.0)); // tailplane
  for (const side of [-1, 1]) {
    const boom = new THREE.CylinderGeometry(0.028, 0.028, 2.0, 8);
    boom.rotateX(Math.PI / 2);
    dark.push(boom.translate(side * 0.78, 0.03, -0.1));
    hull.push(new THREE.BoxGeometry(0.035, 0.34, 0.26).translate(side * 0.78, 0.18, -1.0)); // fin
    for (const z of [0.9, -0.62]) {
      dark.push(new THREE.CylinderGeometry(0.035, 0.035, 0.06, 10).translate(side * 0.78, 0.07, z)); // lift motor
      dark.push(new THREE.BoxGeometry(0.56, 0.008, 0.04).rotateY(side * 0.6 + z).translate(side * 0.78, 0.11, z)); // parked blade
    }
  }
  const group = new THREE.Group();
  group.rotation.order = "YXZ";
  const hullMesh = new THREE.Mesh(mergeGeometries(hull)!, new THREE.MeshStandardMaterial({ color: 0x8b9096, roughness: 0.5, metalness: 0.2 }));
  const darkMesh = new THREE.Mesh(mergeGeometries(dark)!, new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.6, metalness: 0.3 }));
  hullMesh.castShadow = darkMesh.castShadow = true;
  const pusher = new THREE.Mesh(
    new THREE.CircleGeometry(0.26, 24),
    new THREE.MeshBasicMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }),
  );
  pusher.position.set(0, 0, -0.86);
  group.add(hullMesh, darkMesh, pusher);
  // Wingtip lights (red left, green right) and a white strobe on the tail
  const light = (color: number, size: number, x: number, y: number, z: number) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(size);
    s.position.set(x, y, z);
    group.add(s);
    return s;
  };
  light(0xff2a2a, 0.5, 1.7, 0.05, 0.15);
  light(0x2aff6a, 0.5, -1.7, 0.05, 0.15);
  const strobe = light(0xffffff, 1.1, 0, 0.5, -1.0);
  group.scale.setScalar(1.3);
  return { group, strobe };
}

/** Interceptor: compact, dark X-quad with an accent nose and a thrust glow. Forward is +z. */
function makeInterceptor(glow: THREE.Texture, accent: THREE.Material) {
  const dark: THREE.BufferGeometry[] = [new THREE.BoxGeometry(0.24, 0.1, 0.44)];
  for (const [x, z] of [[0.28, 0.24], [-0.28, 0.24], [0.28, -0.24], [-0.28, -0.24]]) {
    const len = Math.hypot(x, z);
    const arm = new THREE.BoxGeometry(len, 0.03, 0.04);
    arm.rotateY(-Math.atan2(z, x));
    dark.push(arm.translate(x / 2, 0, z / 2));
    dark.push(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10).translate(x, 0.03, z));
  }
  const group = new THREE.Group();
  group.rotation.order = "YXZ";
  const body = new THREE.Mesh(mergeGeometries(dark)!, new THREE.MeshStandardMaterial({ color: 0x17181b, roughness: 0.45, metalness: 0.5 }));
  body.castShadow = true;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 12).rotateX(Math.PI / 2).translate(0, 0, 0.32), accent);
  const discs = new THREE.Mesh(
    mergeGeometries([0, 1, 2, 3].map((i) => new THREE.CircleGeometry(0.17, 20).rotateX(-Math.PI / 2).translate(i < 2 ? 0.28 : -0.28, 0.07, i % 2 ? 0.24 : -0.24)))!,
    new THREE.MeshBasicMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }),
  );
  const thrust = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xd7263d, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  thrust.position.set(0, 0, -0.3);
  thrust.scale.setScalar(0.9);
  group.add(body, nose, discs, thrust);
  group.scale.setScalar(1.4);
  return { group, discs, thrust };
}

export function createInterceptAct({ scene, ground, pad, padY, glow }: Ctx) {
  const accentLine = new THREE.Color(0xd7263d);
  const accentSurface = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.4, emissive: 0xd7263d, emissiveIntensity: 0.4 });

  const vtol = makeVtol(glow);
  const icpt = makeInterceptor(glow, accentSurface);
  scene.add(vtol.group, icpt.group);

  const home = new THREE.Vector3(pad.x + 6.5, 0, pad.z + 1);
  home.y = ground(home.x, home.z) + 0.15;

  const vtolTrail = makeTrail(0xffffff, 0.18);
  const icptTrail = makeTrail(0xd7263d, 0.75);
  scene.add(vtolTrail.line, icptTrail.line);

  // Radar pings: flat rings that sweep out from the pad
  const pingMat = new THREE.MeshBasicMaterial({ color: 0xd7263d, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  const pingGeo = new THREE.RingGeometry(0.88, 1, 128).rotateX(-Math.PI / 2);
  const pings = [0, 1].map(() => {
    const p = new THREE.Mesh(pingGeo, pingMat.clone());
    p.position.set(pad.x, padY + 0.25, pad.z);
    p.visible = false;
    scene.add(p);
    return p;
  });

  const reticleTex = reticleTexture();
  const reticle = new THREE.Sprite(new THREE.SpriteMaterial({ map: reticleTex, color: 0xd7263d, transparent: true, depthWrite: false, depthTest: false }));
  reticle.visible = false;
  scene.add(reticle);

  const trackGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const track = new THREE.Line(trackGeo, new THREE.LineDashedMaterial({ color: 0xd7263d, dashSize: 0.8, gapSize: 0.6, transparent: true, opacity: 0.8 }));
  track.frustumCulled = false;
  track.visible = false;
  scene.add(track);

  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xffb066, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  flash.visible = false;
  const flashLight = new THREE.PointLight(0xff9a4a, 0, 40, 1.6);
  scene.add(flash, flashLight);

  const debrisMat = new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.7 });
  const debris = Array.from({ length: DEBRIS }, (_, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.08 + (i % 4) * 0.05, 0.03, 0.1 + (i % 3) * 0.08), debrisMat);
    m.visible = false;
    m.castShadow = true;
    scene.add(m);
    return { mesh: m, vel: new THREE.Vector3(), spin: new THREE.Vector3() };
  });

  // State
  const vPos = new THREE.Vector3();
  const vVel = new THREE.Vector3();
  let vYaw = 0;
  let vState: "flying" | "falling" | "gone" = "flying";
  const iPos = new THREE.Vector3();
  const iVel = new THREE.Vector3();
  let iSpeed = 0;
  let iRpm = 0;
  let iState: "parked" | "climb" | "chase" | "gone" = "parked";
  let hitAt = -1;
  const hitPos = new THREE.Vector3();
  const focus = new THREE.Vector3();
  const tmp = new THREE.Vector3();

  const park = () => {
    iPos.copy(home);
    iVel.set(0, 0, 0);
    icpt.group.position.copy(home);
    icpt.group.rotation.set(0, -Math.PI / 2, 0);
    icpt.group.visible = true;
    icpt.discs.visible = false;
    icpt.thrust.visible = false;
  };

  const hideAll = () => {
    vtol.group.visible = false;
    reticle.visible = track.visible = flash.visible = false;
    flashLight.intensity = 0;
    pings.forEach((p) => (p.visible = false));
    debris.forEach((d) => (d.mesh.visible = false));
    vtolTrail.clear();
    icptTrail.clear();
  };

  const reset = () => {
    hideAll();
    vPos.copy(VTOL_START);
    vPos.y = ground(vPos.x, vPos.z) + VTOL_ALT;
    vYaw = VTOL_HEADING;
    vState = "flying";
    vtol.group.visible = true;
    vtol.group.rotation.set(0, vYaw, 0);
    iSpeed = 0;
    iRpm = 0;
    iState = "parked";
    hitAt = -1;
    (icptTrail.line.material as THREE.LineBasicMaterial).opacity = 0.75;
    (vtolTrail.line.material as THREE.LineBasicMaterial).opacity = 0.18;
    park();
  };

  /** Advance the act to tc seconds. Returns where the camera should look, and whether the pad is on alert. */
  const update = (tc: number, dt: number) => {
    // --- VTOL
    if (vState === "flying") {
      const yawRate = tc > 4.2 ? Math.sin((tc - 4.2) * 1.8) * 0.45 : 0; // evasive weave once locked
      vYaw += yawRate * dt;
      vVel.set(Math.sin(vYaw) * VTOL_SPEED, 0, Math.cos(vYaw) * VTOL_SPEED);
      const ahead = Math.max(ground(vPos.x, vPos.z), ground(vPos.x + vVel.x * 0.8, vPos.z + vVel.z * 0.8));
      const wantY = Math.max(ahead, padY) + VTOL_ALT;
      vVel.y = (wantY - vPos.y) * 1.2;
      vPos.addScaledVector(vVel, dt);
      vtol.group.position.copy(vPos);
      vtol.group.rotation.set(-vVel.y * 0.03, vYaw, -yawRate * 1.1);
      vtolTrail.push(vPos);
    } else if (vState === "falling") {
      vVel.y -= 9.8 * dt;
      vVel.x *= 1 - dt * 0.3;
      vVel.z *= 1 - dt * 0.3;
      vPos.addScaledVector(vVel, dt);
      vtol.group.position.copy(vPos);
      vtol.group.rotation.z += dt * 4;
      vtol.group.rotation.x += dt * 1.5;
      if (vPos.y < ground(vPos.x, vPos.z)) {
        vState = "gone";
        vtol.group.visible = false;
      }
    }
    vtol.strobe.visible = vState === "flying" && tc % 1.1 < 0.07;
    (vtol.group.children[2] as THREE.Mesh).rotation.z += dt * 40;

    // --- Radar pings
    pings.forEach((p, i) => {
      const age = tc - 1.8 - i * 0.6;
      p.visible = age > 0 && age < 1.6;
      if (!p.visible) return;
      p.scale.setScalar(2 + age * 22); // stays out in the valley, short of the camera
      (p.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - age / 1.6);
    });

    // --- Reticle: acquire (spinning, blinking, closing in), then lock
    const locked = tc >= 4.2;
    reticle.visible = vState === "flying" && tc >= 3.0 && (locked || Math.floor(tc * 8) % 2 === 0);
    if (reticle.visible) {
      reticle.position.copy(vPos);
      const k = THREE.MathUtils.smoothstep(tc, 3.0, 4.2);
      reticle.scale.setScalar(THREE.MathUtils.lerp(9, 4.2, k) + (locked ? Math.sin(tc * 10) * 0.15 : 0));
      reticle.material.rotation = locked ? 0 : (4.2 - tc) * 2.5;
    }

    // --- Interceptor
    if (iState === "parked" && tc >= 4.4) iState = "climb";
    if (iState === "climb" || iState === "chase") {
      iRpm = Math.min(1, iRpm + dt * 2.5);
      icpt.discs.visible = true;
      icpt.thrust.visible = true;
      icpt.discs.rotation.y += dt * 50;
    }
    if (iState === "climb" && tc >= 4.8) {
      iVel.y += (6 - iVel.y) * Math.min(1, dt * 4);
      iPos.addScaledVector(iVel, dt);
      if (tc >= 5.5) {
        iState = "chase";
        iSpeed = iVel.length();
      }
    } else if (iState === "chase") {
      iSpeed = Math.min(MAX_CHASE_SPEED, iSpeed + 26 * dt);
      const dist = iPos.distanceTo(vPos);
      // Lead pursuit: aim where the target will be when we get there
      tmp.copy(vPos).addScaledVector(vVel, Math.min(dist / Math.max(iSpeed, 1), 2)).sub(iPos).normalize().multiplyScalar(iSpeed);
      iVel.lerp(tmp, Math.min(1, dt * 5));
      iPos.addScaledVector(iVel, dt);
      icptTrail.push(iPos);
      // Hit when close; the time cap is only a safety net so the act always ends
      if ((dist < 1.5 || tc > 11) && vState === "flying") {
        // Impact
        hitAt = tc;
        hitPos.copy(vPos);
        iState = "gone";
        icpt.group.visible = false;
        vState = "falling";
        vVel.multiplyScalar(0.45).add(tmp.copy(iVel).multiplyScalar(0.12));
        debris.forEach((d, i) => {
          d.mesh.visible = true;
          d.mesh.position.copy(hitPos);
          const a = (i / DEBRIS) * Math.PI * 2;
          d.vel.set(Math.cos(a) * (3 + (i % 5)), 2 + (i % 4) * 1.5, Math.sin(a) * (3 + ((i * 7) % 5))).add(tmp.copy(vVel).multiplyScalar(0.6));
          d.spin.set((i % 3) * 4 + 2, (i % 5) * 3, (i % 2) * 5 + 1);
        });
      }
    }
    if (iState === "climb" || iState === "chase") {
      icpt.group.position.copy(iPos);
      const flat = Math.hypot(iVel.x, iVel.z);
      if (flat > 0.5) icpt.group.rotation.set(THREE.MathUtils.clamp(flat * 0.04, 0, 1.0), Math.atan2(iVel.x, iVel.z), 0);
      icpt.thrust.scale.setScalar(0.7 + Math.random() * 0.4);
    }

    // --- Tracking line from interceptor (or its launch spot) to the target while locked
    track.visible = locked && vState === "flying";
    if (track.visible) {
      const p = trackGeo.attributes.position as THREE.BufferAttribute;
      const from = iState === "parked" ? home : iPos;
      p.setXYZ(0, from.x, from.y, from.z);
      p.setXYZ(1, vPos.x, vPos.y, vPos.z);
      p.needsUpdate = true;
      track.computeLineDistances();
    }

    // --- Impact flash and debris
    if (hitAt >= 0) {
      const age = tc - hitAt;
      flash.visible = age < 0.8;
      if (flash.visible) {
        flash.position.copy(hitPos);
        flash.scale.setScalar(2 + age * 16);
        flash.material.opacity = 1 - age / 0.8;
      }
      flashLight.position.copy(hitPos);
      flashLight.intensity = Math.max(0, 1 - age / 0.6) * 120;
      // Trails fade out after impact
      const fade = Math.max(0, 1 - age / 1.5);
      (icptTrail.line.material as THREE.LineBasicMaterial).opacity = 0.75 * fade;
      (vtolTrail.line.material as THREE.LineBasicMaterial).opacity = 0.18 * fade;
      for (const d of debris) {
        if (!d.mesh.visible) continue;
        d.vel.y -= 9.8 * dt;
        d.mesh.position.addScaledVector(d.vel, dt);
        d.mesh.rotation.x += d.spin.x * dt;
        d.mesh.rotation.y += d.spin.y * dt;
        d.mesh.rotation.z += d.spin.z * dt;
        if (d.mesh.position.y < ground(d.mesh.position.x, d.mesh.position.z)) d.mesh.visible = false;
      }
    }

    // --- Where the camera should look
    if (hitAt >= 0) focus.copy(hitPos);
    else if (iState === "chase" || iState === "climb") focus.copy(vPos).add(iPos).multiplyScalar(0.5);
    else focus.copy(vPos);
    return { focus, alert: tc >= 1.8 && hitAt < 0 };
  };

  /** Outside the act: VTOL and effects hidden, interceptor parked beside the pad. */
  const idle = () => {
    hideAll();
    if (iState !== "parked") {
      iState = "parked";
      park();
    }
  };

  const setAccent = (c: THREE.Color) => {
    accentLine.copy(c);
    accentSurface.color.copy(c);
    accentSurface.emissive.copy(c);
    pings.forEach((p) => (p.material as THREE.MeshBasicMaterial).color.copy(c));
    reticle.material.color.copy(c);
    (track.material as THREE.LineDashedMaterial).color.copy(c);
    (icptTrail.line.material as THREE.LineBasicMaterial).color.copy(c);
    icpt.thrust.material.color.copy(c);
  };

  const dispose = () => {
    [vtolTrail.line, icptTrail.line, track].forEach((l) => {
      l.geometry.dispose();
      (l.material as THREE.Material).dispose();
    });
    reticleTex.dispose();
    pingMat.dispose();
  };

  idle();
  return { reset, update, idle, setAccent, dispose };
}
