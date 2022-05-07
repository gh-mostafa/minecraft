import * as THREE from "../vendors/three.module.js";
import Game from "./game.js";

window.onload = () => {
  
  const container = document.getElementById("container");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x88ccee);
  //scene.fog = new THREE.Fog(0x88ccee, 0, 150);

  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.rotation.order = "YXZ";


  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  /* //renderer.shadowMap.enabled = true;
  //renderer.shadowMap.type = THREE.VSMShadowMap;
  //renderer.outputEncoding = THREE.sRGBEncoding;
  //renderer.toneMapping = THREE.ACESFilmicToneMapping; */
  container.appendChild(renderer.domElement);





  
  const gameInstance = Game(camera, scene, renderer);


  function animate() {
    //requestAnimationFrame(animate);
    //gameInstance.update();
    renderer.render(scene, camera);
  }
  //animate();
};

