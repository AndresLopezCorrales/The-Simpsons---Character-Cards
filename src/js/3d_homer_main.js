import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById("three-canvas");
const container = document.getElementById("three-container");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
    30,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);
camera.position.set(0, 3, 15);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 1));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

// Load model
const loader = new GLTFLoader();
loader.load("./models/homer_simpson/scene.gltf", (gltf) => {
    const model = gltf.scene;
    model.scale.set(1.2, 1.2, 1.2);
    scene.add(model);
});

// Animate
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize
function resizeRenderer() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
}

resizeRenderer();
window.addEventListener("resize", resizeRenderer);

