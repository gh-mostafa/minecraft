import * as THREE from "../vendors/three.module.js";
import character from "./character.js";
import { Capsule } from "../vendors/libs/Capsule.js";

import ammotest from "./ammotest.js";

import Stats from "../vendors/libs/stats.module.js";

function Game(camera, scene, renderer) {
  let ppx;
  let ppz;
  const gs = 2; //12
  const wiveRange = 3; // 10
  const length = 100; // 100
  const maxH = 25; // 25
  const wLevel = -15; // -15
  const gridsize = gs * 2 + 1; // 25

  const clock = new THREE.Clock();
  const STEPS_PER_FRAME = 5;

  const GRAVITY = 30;

  const stats = new Stats();
  stats.domElement.style.position = "absolute";
  stats.domElement.style.top = "0px";
  container.appendChild(stats.domElement);

  _resizeFunc(camera, renderer);
  _mouseRotate(camera);

  const keyStates = {};
  _setInput(keyStates);

  const playerVelocity = new THREE.Vector3();
  const playerDirection = new THREE.Vector3();
  let playerOnFloor = false;
  let mouseTime = 0;

  const playerCollider = new Capsule(
    new THREE.Vector3(0, 0.35, 0),
    new THREE.Vector3(0, 1, 0),
    0.35
  );

  const material0 = new THREE.MeshBasicMaterial({ color: 0x0088ff });
  material0.side = THREE.DoubleSide;
  material0.transparent = true;
  material0.opacity = 0.45;
  const material1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const material2 = new THREE.MeshBasicMaterial({ color: 0x771111 });
  const material3 = new THREE.MeshBasicMaterial({ color: 0xffff88 });

  Start();

  function Start() {
    _initializeScene();
    _createGround();
    //character(camera, scene, renderer, playerVelocity, playerDirection);

    ppx = Math.floor((camera.position.x - gridsize / 2) / gridsize) + 1;
    ppz = Math.floor((camera.position.z - gridsize / 2) / gridsize) + 1;

    update();

    //ammotest(camera, scene, renderer,clock);
  }

  function update() {
    requestAnimationFrame(update);

    let dx =
      ppx - (Math.floor((camera.position.x - gridsize / 2) / gridsize) + 1);
    let dz =
      ppz - (Math.floor((camera.position.z - gridsize / 2) / gridsize) + 1);

    if (dx != 0 || dz != 0) {
      ppx = Math.floor((camera.position.x - gridsize / 2) / gridsize) + 1;
      ppz = Math.floor((camera.position.z - gridsize / 2) / gridsize) + 1;

      console.log(ppx, ppz);
      console.log(camera.position.x, camera.position.z, "aa");
    }

    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      _movementControls(deltaTime);
      _updatePlayer(deltaTime);

      _teleportPlayerIfOob();
    }

    Rendering();
  }

  function _checkCollisions() {
    //
  }
  function _updateInfoPanel() {
    //
  }

  function _gameOver() {
    // show "end state" UI
    // reset instance variables for a new game
  }

  function _makeFace(cx, _cy, cz, h, l, s) {
    let txtr1 = []; // grass
    let txtr2 = []; // grass wall
    let txtr3 = []; // water
    let txtr4 = []; // sand

    let cy = _cy;
    let zcheck = false;
    do {
      zcheck = false;

      const wpoint5 = [(-0.5 + cx) * s, (0.5 + wLevel) * s, (-0.5 + cz) * s]; // t ba l
      const wpoint6 = [(0.5 + cx) * s, (0.5 + wLevel) * s, (-0.5 + cz) * s]; // t ba r
      const wpoint7 = [(0.5 + cx) * s, (0.5 + wLevel) * s, (0.5 + cz) * s]; // t f r
      const wpoint8 = [(-0.5 + cx) * s, (0.5 + wLevel) * s, (0.5 + cz) * s]; // t f l

      const point1 = [(-0.5 + cx) * s, (-0.5 + cy) * s, (-0.5 + cz) * s]; // bu ba l
      const point2 = [(0.5 + cx) * s, (-0.5 + cy) * s, (-0.5 + cz) * s]; // bu ba r
      const point3 = [(0.5 + cx) * s, (-0.5 + cy) * s, (0.5 + cz) * s]; // bu f r
      const point4 = [(-0.5 + cx) * s, (-0.5 + cy) * s, (0.5 + cz) * s]; // bu f l
      const point5 = [(-0.5 + cx) * s, (0.5 + cy) * s, (-0.5 + cz) * s]; // t ba l
      const point6 = [(0.5 + cx) * s, (0.5 + cy) * s, (-0.5 + cz) * s]; // t ba r
      const point7 = [(0.5 + cx) * s, (0.5 + cy) * s, (0.5 + cz) * s]; // t f r
      const point8 = [(-0.5 + cx) * s, (0.5 + cy) * s, (0.5 + cz) * s]; // t f l

      const face0 = []; // water
      const face1 = []; // bu
      const face2 = []; // t
      const face3 = []; // f
      const face4 = []; // ba
      const face5 = []; // r
      const face6 = []; // l

      face0.push(...wpoint8);
      face0.push(...wpoint7);
      face0.push(...wpoint6);
      face0.push(...wpoint8);
      face0.push(...wpoint6);
      face0.push(...wpoint5);

      face1.push(...point1);
      face1.push(...point2);
      face1.push(...point3);
      face1.push(...point1);
      face1.push(...point3);
      face1.push(...point4);

      face2.push(...point8);
      face2.push(...point7);
      face2.push(...point6);
      face2.push(...point8);
      face2.push(...point6);
      face2.push(...point5);

      face3.push(...point4);
      face3.push(...point3);
      face3.push(...point7);
      face3.push(...point4);
      face3.push(...point7);
      face3.push(...point8);

      face4.push(...point2);
      face4.push(...point1);
      face4.push(...point5);
      face4.push(...point2);
      face4.push(...point5);
      face4.push(...point6);

      face5.push(...point3);
      face5.push(...point2);
      face5.push(...point6);
      face5.push(...point3);
      face5.push(...point6);
      face5.push(...point7);

      face6.push(...point1);
      face6.push(...point4);
      face6.push(...point8);
      face6.push(...point1);
      face6.push(...point8);
      face6.push(...point5);

      const valume = [];
      /* valume.push(...face1);
    valume.push(...face2);
    valume.push(...face3);
    valume.push(...face4);
    valume.push(...face5); 
    valume.push(...face6); */

      if (
        parseInt(
          perlin.get(
            (cx + 1 + Math.floor(l / 2)) / l,
            (cz + Math.floor(l / 2)) / l
          ) *
            h -
            h / 2
        ) < cy
      ) {
        if (cy > wLevel) {
          valume.push(...face5);
        } else {
          txtr4.push(...face5);
        }
        zcheck = true;
      }
      if (
        parseInt(
          perlin.get(
            (cx - 1 + Math.floor(l / 2)) / l,
            (cz + Math.floor(l / 2)) / l
          ) *
            h -
            h / 2
        ) < cy
      ) {
        if (cy > wLevel) {
          valume.push(...face6);
        } else {
          txtr4.push(...face6);
        }
        zcheck = true;
      }
      if (
        parseInt(
          perlin.get(
            (cx + Math.floor(l / 2)) / l,
            (cz + 1 + Math.floor(l / 2)) / l
          ) *
            h -
            h / 2
        ) < cy
      ) {
        if (cy > wLevel) {
          valume.push(...face3);
        } else {
          txtr4.push(...face3);
        }
        zcheck = true;
      }
      if (
        parseInt(
          perlin.get(
            (cx + Math.floor(l / 2)) / l,
            (cz - 1 + Math.floor(l / 2)) / l
          ) *
            h -
            h / 2
        ) < cy
      ) {
        if (cy > wLevel) {
          valume.push(...face4);
        } else {
          txtr4.push(...face4);
        }
        zcheck = true;
      }

      if (
        parseInt(
          perlin.get(
            (cx + Math.floor(l / 2)) / l,
            (cz + Math.floor(l / 2)) / l
          ) *
            h -
            h / 2
        ) <= cy
      ) {
        if (cy > wLevel) {
          txtr1.push(...face2);
        } else {
          txtr4.push(...face2);
          if (cy < wLevel) {
            txtr3.push(...face0);
          }
        }
      }

      //txtr1.push(...face2);
      txtr2.push(...valume);

      cy -= 1;
    } while (zcheck);

    const ground = new THREE.Group();

    const geometry1 = new THREE.BufferGeometry();
    const vort1 = new Float32Array(txtr1);
    geometry1.setAttribute("position", new THREE.BufferAttribute(vort1, 3));
    const mesh1 = new THREE.Mesh(geometry1, material1);

    const geometry2 = new THREE.BufferGeometry();
    const vort2 = new Float32Array([...txtr2]);
    geometry2.setAttribute("position", new THREE.BufferAttribute(vort2, 3));
    const mesh2 = new THREE.Mesh(geometry2, material2);

    const geometry0 = new THREE.BufferGeometry();
    const vort0 = new Float32Array([...txtr3]);
    geometry0.setAttribute("position", new THREE.BufferAttribute(vort0, 3));
    const mesh0 = new THREE.Mesh(geometry0, material0);

    const geometry3 = new THREE.BufferGeometry();
    const vort3 = new Float32Array([...txtr4]);
    geometry3.setAttribute("position", new THREE.BufferAttribute(vort3, 3));
    const mesh3 = new THREE.Mesh(geometry3, material3);

    ground.add(mesh0);
    ground.add(mesh1);
    ground.add(mesh2);
    ground.add(mesh3);

    scene.add(ground);
  }

  function _makepart(cx, cz) {
    for (let i = -(gridsize - 1) / 2 + cx; i <= (gridsize - 1) / 2 + cx; i++) {
      for (
        let j = -(gridsize - 1) / 2 + cz;
        j <= (gridsize - 1) / 2 + cz;
        j++
      ) {
        let _z = parseInt(
          perlin.get(
            (i + Math.floor(length / 2)) / length,
            (j + Math.floor(length / 2)) / length
          ) *
            maxH -
            maxH / 2
        );
        _makeFace(i, _z, j, maxH, length, 1);
      }
    }
  }

  function _createGround() {
    for (let i = -wiveRange; i <= wiveRange; i++) {
      for (let j = -wiveRange; j <= wiveRange; j++) {
        _makepart(i * gridsize, j * gridsize);
      }
    }
  }

  function _initializeScene() {
    /* const fillLight1 = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
    fillLight1.position.set(2, 1, 1);
    scene.add(fillLight1); */
    /* const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-5, 25, -1);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.01;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.radius = 4;
    directionalLight.shadow.bias = -0.00006;
    scene.add(directionalLight); */
  }

  function _getForwardVector() {
    camera.getWorldDirection(playerDirection);
    //playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;
  }

  function _getSideVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;
  }

  function _movementControls(deltaTime) {
    // gives a bit of air control
    let speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

    speedDelta *= 3;

    if (keyStates["KeyW"]) {
      playerVelocity.add(
        _getForwardVector(camera, playerDirection).multiplyScalar(speedDelta)
      );
    }

    if (keyStates["KeyS"]) {
      playerVelocity.add(
        _getForwardVector(camera, playerDirection).multiplyScalar(-speedDelta)
      );
    }

    if (keyStates["KeyA"]) {
      playerVelocity.add(
        _getSideVector(camera, playerDirection).multiplyScalar(-speedDelta)
      );
    }

    if (keyStates["KeyD"]) {
      playerVelocity.add(
        _getSideVector(camera, playerDirection).multiplyScalar(speedDelta)
      );
    }

    if (playerOnFloor) {
      if (keyStates["Space"]) {
        playerVelocity.y = 15;
      }
    }
  }

  function _teleportPlayerIfOob() {
    if (camera.position.y <= -70) {
      playerCollider.start.set(0, 0.35, 0);
      playerCollider.end.set(0, 1, 0);
      playerCollider.radius = 0.35;
      camera.position.copy(playerCollider.end);
      camera.rotation.set(0, 0, 0);
    }
  }

  function _updatePlayer(deltaTime) {
    let damping = Math.exp(-4 * deltaTime) - 1;

    /* if (!playerOnFloor) {
      playerVelocity.y -= GRAVITY * deltaTime;

      // small air resistance
      damping *= 0.1;
    } */

    playerVelocity.addScaledVector(playerVelocity, damping);

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);

    //_playerCollisions();

    camera.position.copy(playerCollider.end);
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

  function _setInput() {
    //
    document.addEventListener("keydown", (event) => {
      keyStates[event.code] = true;

      //update(); //update();
    });

    document.addEventListener("keyup", (event) => {
      keyStates[event.code] = false;

      //update(); //update();
    });
  }

  function _mouseRotate() {
    container.addEventListener("mousedown", () => {
      document.body.requestPointerLock();

      mouseTime = performance.now();
    });

    document.body.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;

        //update(); //update();
      }
    });
  }

  function _resizeFunc() {
    window.addEventListener("resize", onWindowResize);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  function Rendering() {
    renderer.render(scene, camera);

    stats.update();
  }
}

export default Game;
