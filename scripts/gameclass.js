import * as THREE from "../vendors/three.module.js";
import character from "./character.js";
import { Capsule } from "../vendors/libs/Capsule.js";

class Game {
  constructor(camera, scene, renderer) {
    const clock = new THREE.Clock();

    this._resizeFunc(camera, renderer);
    this._mouseRotate(camera);

    const keyStates = {};
    this._setInput(keyStates);

    const playerVelocity = new THREE.Vector3();
    const playerDirection = new THREE.Vector3();
    let playerOnFloor = false;

    const playerCollider = new Capsule(
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0, 1, 0),
      0.35
    );

    this.update(
      camera,
      scene,
      renderer,
      clock,
      keyStates,
      playerVelocity,
      playerDirection,
      playerOnFloor,
      playerCollider
    );

    this._initializeScene(camera, scene);
    this._createGround(scene);
    character(camera, scene, renderer, playerVelocity, playerDirection);
  }

  update(
    camera,
    scene,
    renderer,
    clock,
    keyStates,
    playerVelocity,
    playerDirection,
    playerOnFloor,
    playerCollider
  ) {
    const STEPS_PER_FRAME = 5;
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      this._movementControls(
        camera,
        deltaTime,
        keyStates,
        playerVelocity,
        playerDirection,
        playerOnFloor
      );

      this._teleportPlayerIfOob(camera, playerCollider);
    }

    setTimeout(() => {
      renderer.render(scene, camera);
      console.log("render");
    }, 1000);
    renderer.render(scene, camera);
  }

  _checkCollisions() {
    //
  }
  _updateInfoPanel() {
    //
  }

  _gameOver() {
    // show "end state" UI
    // reset instance variables for a new game
  }

  _createGround(scene) {
    this.ship = new THREE.Group();

    const blockGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    const blockMaterial = new THREE.MeshBasicMaterial({
      color: 0x99aacc,
    });

    const length = 21;
    const maxH = 5;

    for (let i = -Math.floor(length / 2); i <= Math.floor(length / 2); i++) {
      for (let j = -Math.floor(length / 2); j <= Math.floor(length / 2); j++) {
        var cl = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);

        const blockMateria = new THREE.MeshBasicMaterial({
          color: cl,
        });

        const shipBody = new THREE.Mesh(blockGeometry, blockMateria);
        shipBody.position.set(
          i,
          parseInt(
            perlin.get(
              (i + Math.floor(length / 2)) / length,
              (j + Math.floor(length / 2)) / length
            ) * maxH
          ),
          j
        );
        this.ship.add(shipBody);
      }
    }
    /* const shipBody = new THREE.Mesh(blockGeometry, blockMaterial);
    this.ship.add(shipBody); */

    scene.add(this.ship);
  }

  _initializeScene(camera, scene) {
    const fillLight1 = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
    fillLight1.position.set(2, 1, 1);
    scene.add(fillLight1);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
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
    scene.add(directionalLight);
  }

  _getForwardVector(camera, playerDirection) {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;
  }

  _getSideVector(camera, playerDirection) {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;
  }

  _movementControls(
    camera,
    deltaTime,
    keyStates,
    playerVelocity,
    playerDirection,
    playerOnFloor
  ) {
    // gives a bit of air control
    const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

    if (keyStates["KeyW"]) {
      playerVelocity.add(
        this._getForwardVector(camera, playerDirection).multiplyScalar(
          speedDelta
        )
      );
    }

    if (keyStates["KeyS"]) {
      playerVelocity.add(
        this._getForwardVector(camera, playerDirection).multiplyScalar(
          -speedDelta
        )
      );
    }

    if (keyStates["KeyA"]) {
      playerVelocity.add(
        this._getSideVector(camera, playerDirection).multiplyScalar(-speedDelta)
      );
    }

    if (keyStates["KeyD"]) {
      playerVelocity.add(
        this._getSideVector(camera, playerDirection).multiplyScalar(speedDelta)
      );
    }

    if (playerOnFloor) {
      if (keyStates["Space"]) {
        playerVelocity.y = 15;
      }
    }
  }

  _teleportPlayerIfOob(camera, playerCollider) {
    if (camera.position.y <= -25) {
      playerCollider.start.set(0, 0.35, 0);
      playerCollider.end.set(0, 1, 0);
      playerCollider.radius = 0.35;
      camera.position.copy(playerCollider.end);
      camera.rotation.set(0, 0, 0);
    }
  }

  _setInput(keyStates) {
    //
    document.addEventListener("keydown", (event) => {
      keyStates[event.code] = true;
    });

    document.addEventListener("keyup", (event) => {
      keyStates[event.code] = false;
    });
  }

  _mouseRotate(camera) {
    document.body.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === document.body) {
        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;
      }
    });
  }

  _resizeFunc(camera, renderer) {
    window.addEventListener("resize", onWindowResize);

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}

export default Game;
