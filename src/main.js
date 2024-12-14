import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

let scene, camera, renderer, character, controls, ground;
let moveForward = false, moveBackward = false, turnLeft = false, turnRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const speed = 0.02;
const turnSpeed = -0.05;

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbit_controlls = new OrbitControls(camera, renderer.domElement);

// Character setup
const geometry = new THREE.BoxGeometry(1, 2, 1); // Simple box for character
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
character = new THREE.Mesh(geometry, material);
// scene.add(character);

// Animation
let mixer;

// Load the 3D model
const loader = new GLTFLoader();
loader.load(
    'public/Assets/Animated_Farmer_2.glb',
    function (gltf) {
        character = gltf.scene;
        character.position.set(0, -1, 0);
        character.rotation.y = Math.PI / 2; // Rotate the character 90 degrees on the Y-axis
        scene.add(character);
        mixer = new THREE.AnimationMixer(character);
        const clips = gltf.animations;
        // Use to find the perticular Animation.
        // const clip = THREE.AnimationClip.findByName(clips, 'Walking');   

        const action = mixer.clipAction(clips[0]);
        action.play();


        // Set up the animation mixer
        // mixer = new THREE.AnimationMixer(character);

        // Add all animations to the mixer
        // gltf.animations.forEach((clip) => {
        //     mixer.clipAction(clip).play();
        // });
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
        console.error(error);
    }
);

// Initial character position (on the ground)
character.position.y = 1;  // Half the height of the character to place it on the ground

// Camera initial position
camera.position.set(0, 5, 10);
camera.lookAt(character.position);

// Right Click Listener
// document.addEventListener('click', () => {
//     controls.lock();
// });

// Key press and release events
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Basic ground plane
// const planeGeometry = new THREE.PlaneGeometry(100, 100);
// const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555 });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// plane.rotation.x = -Math.PI / 2;
// scene.add(plane);
// const gridHelper = new THREE.GridHelper(100, 100);
// scene.add(gridHelper);

// Adding Lights
const ambientLight = new THREE.AmbientLight(0x333333, 35);
scene.add(ambientLight);

loader.load(
    'public/Assets/Low_Poly_Farm.glb',
    function (gltf) {
        ground = gltf.scene;
        ground.position.set(0, -1, 0);
        scene.add(ground);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
        console.error(error);
    }
);

window.addEventListener('resize', onWindowResize);
// }

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyS': moveForward = true; break;
        case 'KeyA': turnLeft = true; break;
        case 'KeyW': moveBackward = true; break;
        case 'KeyD': turnRight = true; break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyS': moveForward = false; break;
        case 'KeyA': turnLeft = false; break;
        case 'KeyW': moveBackward = false; break;
        case 'KeyD': turnRight = false; break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let animationSpeed = 1;
const clock = new THREE.Clock();
function animate() {
    // Animation
    // mixer.update(0.02);
    requestAnimationFrame(animate);

    orbit_controlls.update(clock.getDelta());

    // Movement and rotation logic
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.normalize(); // ensures consistent movements in all directions

    // Rotate the character based on turn direction
    if (turnLeft) {
        character.rotation.y -= turnSpeed;
    }
    if (turnRight) {
        character.rotation.y += turnSpeed;
    }

    // Move the character forward/backward while maintaining its Y position (on the ground)
    if (moveForward || moveBackward) {
        const currentY = character.position.y;
        character.translateZ(-direction.z * speed);
        character.position.y = currentY; // Keep the character on the ground

        // Play walking animation
        // if (mixer && moveBackward) {
        //     mixer.update(clock.getDelta());
        // }
        if(moveBackward) {
            if (mixer) mixer.update(0.02 * animationSpeed); // Update the mixer to play animations
        }
        if(moveForward) {
            if (mixer) mixer.update(0.02 * -animationSpeed); // Update the mixer to play animations
        }
    }

    // Update camera to follow the character
    // camera.position.set(-2, 5, 2);
    // camera.position.x = 2;
    const relativeCameraOffset = new THREE.Vector3(0, 1, -2);
    const cameraOffset = relativeCameraOffset.applyMatrix4(character.matrixWorld);
    camera.position.lerp(cameraOffset, 0.1);
    // camera.position.y = 2;
    // camera.position.z = 2;
    camera.lookAt(character.position);

    renderer.render(scene, camera);
}

animate();
