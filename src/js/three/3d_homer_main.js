import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById("three-canvas");
const container = document.getElementById("three-container");

// Scene
const scene = new THREE.Scene();
scene.background = null;

// Camera
const camera = new THREE.PerspectiveCamera(
    30,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);
camera.position.set(0, 3, 15);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = false;
scene.add(dirLight);

scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.3));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 5;
controls.maxPolarAngle = Math.PI / 2;

let currentModel = null;

function disposeModel(model) {
    model.traverse(child => {
        if (child.isMesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
            } else {
                child.material?.dispose();
            }
        }
    });
    scene.remove(model);
}

const loader = new GLTFLoader();
loader.load("./models/homer_simpson/scene.gltf", (gltf) => {

    if (currentModel) {
        disposeModel(currentModel);
    }

    currentModel = gltf.scene;
    currentModel.scale.set(1.2, 1.2, 1.2);

    currentModel.traverse(child => {
        if (child.isMesh) {
            child.frustumCulled = true;
            if (child.material) {
                child.material.precision = 'mediump';
            }
        }
    });

    scene.add(currentModel);
});

let animationId;

// Animate
function animate() {
    animationId = requestAnimationFrame(animate);
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

let resizeTimeout;

function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeRenderer();
    }, 100);
}

resizeRenderer();
window.addEventListener("resize", handleResize);

window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animationId);
    controls.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
});

