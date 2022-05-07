import * as THREE from "../vendors/three.module.js";

import Stats from "../vendors/libs/stats.module.js";

import { GLTFLoader } from "../vendors/libs/GLTFLoader.js";

import { Octree } from "../vendors/libs/Octree.js";
import { OctreeHelper } from "../vendors/libs/OctreeHelper.js";

import { Capsule } from "../vendors/libs/Capsule.js";

import { GUI } from "../vendors/libs/lil-gui.module.min.js";

function Character(camera, scene, renderer,playerVelocity,playerDirection) {




  

  const GRAVITY = 30;

  const NUM_SPHERES = 100;
  const SPHERE_RADIUS = 0.2;

  const STEPS_PER_FRAME = 5;

  const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
  const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xbbbb44 });

  const spheres = [];
  let sphereIdx = 0;

  for (let i = 0; i < NUM_SPHERES; i++) {
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    scene.add(sphere);

    spheres.push({
      mesh: sphere,
      collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
      velocity: new THREE.Vector3(),
    });
  }

  const worldOctree = new Octree();

  const playerCollider = new Capsule(
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(0, 1, 0),
    0.35
  );


  let playerOnFloor = false;
  let mouseTime = 0;

  

  const vector1 = new THREE.Vector3();
  const vector2 = new THREE.Vector3();
  const vector3 = new THREE.Vector3();


  

  document.addEventListener("mouseup", () => {
    if (document.pointerLockElement !== null) throwBall();
  });

  

  

  function throwBall() {
    const sphere = spheres[sphereIdx];

    camera.getWorldDirection(playerDirection);

    sphere.collider.center
      .copy(playerCollider.end)
      .addScaledVector(playerDirection, playerCollider.radius * 1.5);

    // throw the ball with more force if we hold the button longer, and if we move forward

    const impulse =
      15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));

    sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
    sphere.velocity.addScaledVector(playerVelocity, 2);

    sphereIdx = (sphereIdx + 1) % spheres.length;
  }

  

  

  function playerSphereCollision(sphere) {
    const center = vector1
      .addVectors(playerCollider.start, playerCollider.end)
      .multiplyScalar(0.5);

    const sphere_center = sphere.collider.center;

    const r = playerCollider.radius + sphere.collider.radius;
    const r2 = r * r;

    // approximation: player = 3 spheres

    for (const point of [playerCollider.start, playerCollider.end, center]) {
      const d2 = point.distanceToSquared(sphere_center);

      if (d2 < r2) {
        const normal = vector1.subVectors(point, sphere_center).normalize();
        const v1 = vector2
          .copy(normal)
          .multiplyScalar(normal.dot(playerVelocity));
        const v2 = vector3
          .copy(normal)
          .multiplyScalar(normal.dot(sphere.velocity));

        playerVelocity.add(v2).sub(v1);
        sphere.velocity.add(v1).sub(v2);

        const d = (r - Math.sqrt(d2)) / 2;
        sphere_center.addScaledVector(normal, -d);
      }
    }
  }

  function spheresCollisions() {
    for (let i = 0, length = spheres.length; i < length; i++) {
      const s1 = spheres[i];

      for (let j = i + 1; j < length; j++) {
        const s2 = spheres[j];

        const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
        const r = s1.collider.radius + s2.collider.radius;
        const r2 = r * r;

        if (d2 < r2) {
          const normal = vector1
            .subVectors(s1.collider.center, s2.collider.center)
            .normalize();
          const v1 = vector2
            .copy(normal)
            .multiplyScalar(normal.dot(s1.velocity));
          const v2 = vector3
            .copy(normal)
            .multiplyScalar(normal.dot(s2.velocity));

          s1.velocity.add(v2).sub(v1);
          s2.velocity.add(v1).sub(v2);

          const d = (r - Math.sqrt(d2)) / 2;

          s1.collider.center.addScaledVector(normal, d);
          s2.collider.center.addScaledVector(normal, -d);
        }
      }
    }
  }

  function updateSpheres(deltaTime) {
    spheres.forEach((sphere) => {
      sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);

      const result = worldOctree.sphereIntersect(sphere.collider);

      if (result) {
        sphere.velocity.addScaledVector(
          result.normal,
          -result.normal.dot(sphere.velocity) * 1.5
        );
        sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
      } else {
        sphere.velocity.y -= GRAVITY * deltaTime;
      }

      const damping = Math.exp(-1.5 * deltaTime) - 1;
      sphere.velocity.addScaledVector(sphere.velocity, damping);

      playerSphereCollision(sphere);
    });

    spheresCollisions();

    for (const sphere of spheres) {
      sphere.mesh.position.copy(sphere.collider.center);
    }
  }



  function _playerCollisions() {
    const result = worldOctree.capsuleIntersect(playerCollider);

    playerOnFloor = false;

    if (result) {
      playerOnFloor = result.normal.y > 0;

      if (!playerOnFloor) {
        playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(playerVelocity)
        );
      }

      playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }


  //const loader = animate();
  /* const loader = new GLTFLoader().setPath("../vendors/gltf/");

  loader.load("collision-world.glb", (gltf) => {
    scene.add(gltf.scene);

    worldOctree.fromGraphNode(gltf.scene);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material.map) {
          child.material.map.anisotropy = 4;
        }
      }
    });

    const helper = new OctreeHelper(worldOctree);
    helper.visible = false;
    scene.add(helper);

    const gui = new GUI({ width: 200 });
    gui.add({ debug: false }, "debug").onChange(function (value) {
      helper.visible = value;
    });

    animate();
  }); */

  

  function animate() {
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    for (let i = 0; i < STEPS_PER_FRAME; i++) {

      updatePlayer(deltaTime);

      updateSpheres(deltaTime);

    }

    renderer.render(scene, camera);

    stats.update();

    requestAnimationFrame(animate);
  }

}
export default Character;
