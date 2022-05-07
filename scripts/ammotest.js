import * as THREE from "../vendors/three.module.js";

function ammotest(camera, scene, renderer, clock) {
  const _scene = scene;
  const GRAVITY = 10;
  // AMMO
  let physicsWorld;
  let rigidBody_List = new Array();
  let tmpTransformation = undefined;

  // 3js

  //let clock, scene, camera, renderer;
  let raycaster = new THREE.Raycaster();
  let tmpPos = new THREE.Vector3(); // start of ray
  let mouseCoords = new THREE.Vector2();

  // **********************************
  // Start AMMO
  Ammo().then(start);

  function start() {
    tmpTransformation = new Ammo.btTransform(); // store trans to be applied to obj

    initPhysicsWorld();
    //initGraphicsWorld();

    createGround();
    createGridCubes();
    createDropCube();

    //createPlayer();

    addEventHandlers();

    render();
  }

  ///  ******************************************

  function initPhysicsWorld() {
    // config collision detection
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
      dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
      broadphase = new Ammo.btDbvtBroadphase(),
      solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(
      dispatcher,
      broadphase,
      solver,
      collisionConfiguration
    );
    physicsWorld.setGravity(new Ammo.btVector3(0, -GRAVITY, 0));

    //transformAux1 = new Ammo.btTransform();
    //tempBtVec3_1 = new Ammo.btVector3(0, 0, 0);
  }

  ///  ******************************************

  /* function initGraphicsWorld(){

} */

  ///  ******************************************

  function createCube(scale, pos, mass, color, quat) {
    // 3js
    let newCube = new THREE.Mesh(
      new THREE.BoxBufferGeometry(scale.x, scale.y, scale.z),
      new THREE.MeshPhongMaterial({ color: color })
    );
    newCube.position.set(pos.x, pos.y, pos.z);
    _scene.add(newCube);

    // Ammo
    const transform = new Ammo.btTransform();
    transform.setIdentity();

    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    transform.setRotation(
      new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
    );
    const motionState = new Ammo.btDefaultMotionState(transform);

    const physicsShape = new Ammo.btBoxShape(
      new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5)
    );
    physicsShape.setMargin(0.05);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    physicsShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      mass,
      motionState,
      physicsShape,
      localInertia
    );
    const rBody = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(rBody);

    newCube.userData.physicsBody = rBody;
    rigidBody_List.push(newCube);
  }

  ///  ******************************************

  function createGround() {
    createCube(
      new THREE.Vector3(80, 2, 80), // scale
      new THREE.Vector3(15, -5, 30), // pos
      0, // mass
      0x567d46, // color
      { x: 0, y: 0, z: 0, w: 1 }
    ); // quat
  }

  ///  ******************************************

  function createGridCubes() {
    for (let i = 0; i < 15; i += 2.2) {
      for (let j = 0; j < 30; j += 2.1) {
        createCube(
          new THREE.Vector3(2, 2, 1.5),
          new THREE.Vector3(j, i, 35),
          1,
          Math.random() * 0xffffff,
          { x: 0, y: 0, z: 0 }
        );
      }
    }
  }

  ///  ******************************************

  function createDropCube() {
    createCube(
      new THREE.Vector3(10, 5, 10), // scale
      new THREE.Vector3(15, 100, 30), // pos
      1000, // mass
      0xff0000, // color
      { x: 0.383, y: 0, z: 0.383, w: 0.924 }
    ); // quat
  }

  ///  ******************************************

  function createPlayer() {
    createCube(
      new THREE.Vector3(0.1, 0.1, 0.1), // scale
      new THREE.Vector3(
        camera.position.x + 0.2,
        camera.position.y,
        camera.position.z
      ), // pos
      1, // mass
      0xff00, // color
      { x: 0, y: 0, z: 0, w: 1 }
    ); // quat
  }

  ///  ******************************************

  function addEventHandlers() {
    window.addEventListener("mousedown", onmMouseDown, false);
  }

  ///  ******************************************

  function onmMouseDown(event) {
    mouseCoords.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(mouseCoords, camera);

    tmpPos.copy(raycaster.ray.direction);
    tmpPos.add(raycaster.ray.origin);

    const _pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z };
    const _radius = 1;
    const _quat = { x: 0, y: 0, z: 0, w: 1 };
    const _mass = 1;

    const _ball = new THREE.Mesh(
        new THREE.SphereBufferGeometry(_radius),
        new THREE.MeshToonMaterial({emissive: 0xff2bed,emissiveIntensity:0.8})
    );

    _ball.position.set(_pos.x,_pos.y,_pos.z);
    scene.add(_ball);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(_pos.x,_pos.y,_pos.z));
    transform.setRotation(new Ammo.btQuaternion(_quat.x,_quat.y,_quat.z,_quat.w));

    const motionState = new Ammo.btDefaultMotionState(transform);

    const colShape = new Ammo.btSphereShape(_radius);
    colShape.setMargin(0.05);

    const localInertia = new Ammo.btVector3(0,0,0);
    colShape.calculateLocalInertia(_mass,localInertia);


    const rbInfo = new Ammo.btRigidBodyConstructionInfo(_mass,motionState,colShape,localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(body);

    tmpPos.copy(raycaster.ray.direction);
    tmpPos.multiplyScalar(100);

    body.setLinearVelocity(new Ammo.btVector3(tmpPos.x,tmpPos.y,tmpPos.z));

    _ball.userData.physicsBody = body;
    rigidBody_List.push(_ball);



  }


  ///  ******************************************

  function render(){
      const deltaTime = clock.getDelta();
      updatephysicsWorld(deltaTime);
      //renderer.render(scene,camera);
      requestAnimationFrame(render);
  }


  function updatephysicsWorld(deltaTime){
      physicsWorld.stepSimulation(deltaTime,10);

      for (let i = 0; i < rigidBody_List.length; i++) {

        let Graphics_Obj = rigidBody_List[i];
        let Physics_Obj = Graphics_Obj.userData.physicsBody;

        let motionState = Physics_Obj.getMotionState();

        if(motionState){
            motionState.getWorldTransform(tmpTransformation);
            let new_pos = tmpTransformation.getOrigin();
            let new_qua = tmpTransformation.getRotation();

            Graphics_Obj.position.set(new_pos.x(),new_pos.y(),new_pos.z());
            Graphics_Obj.quaternion.set(new_qua.x(),new_qua.y(),new_qua.z(),new_qua.w());
        }
          
      }
  }
}

export default ammotest;
