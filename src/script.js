import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

THREE.ColorManagement.enabled = false;

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const loader = new GLTFLoader();
const loadedData = await loader.loadAsync("spaceship.glb");
const spaceship = loadedData.scene.children.filter((n, i) => i < 4);
const alien = loadedData.scene.children.filter((n, i) => i >= 4);

const worldData = await loader.loadAsync("world.glb")
const world = worldData.scene.children[0]

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Lights
 */
// (color, intensity)
// cheap
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.01);

// moderatet
const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.5);
scene.add(directionalLight);
gui.add(directionalLight, "intensity").min(0).max(1).step(0.01);
// cheap
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
hemisphereLight.position.set(0, 300, 0);
scene.add(hemisphereLight);
gui.add(hemisphereLight, "intensity", 0, 1, 0.01);
// moderatet
const pointLight = new THREE.PointLight(0xff9000, 1, 0);
// x, y, z
pointLight.position.set(1, 0, 4);
scene.add(pointLight);
gui.add(pointLight, "intensity", 0, 1, 0.01);
gui.add(pointLight, "distance", 0, 1, 0.01);



/**
 * Objects
 */
// Material

// Objects

// const torus = new THREE.Mesh(
//   new THREE.TorusGeometry(0.3, 0.2, 32, 64),
//   material
// );
// torus.rotation.x = -0.5 * Math.PI;
// torus.position.x = 0;

// const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
// plane.rotation.x = -Math.PI * 0.5;
// plane.position.y = -0.65;

// scene.add(plane);

spaceship.forEach((n) => {
  n.material.metalness = 0;
  n.position.z += 2
  scene.add(n);
});
alien.forEach((n) => {
  n.position.z += 2
  scene.add(n)
});
console.log(world)

world.scale.x = 5
world.scale.y = 5
world.scale.z = 5
world.position.y = -11
scene.add(world)


/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  50,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 0;
camera.position.y = 1;
camera.position.z = 8;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let hovering = true;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  world.rotation.x = 0.15 * elapsedTime;

  if (hovering) {
    spaceship.forEach((n) => {
      const currentPosition = n.position.y;
      n.position.y = currentPosition + Math.cos(elapsedTime) * 0.001;
    });
    alien.forEach((n) => {
      const currentPosition = n.position.y;
      n.position.y = currentPosition + Math.cos(elapsedTime) * 0.001;
    });
  }

  controls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
  TWEEN.update();
};

function updateTween(from, to, time, node) {
  new TWEEN.Tween(from)
    .to(to, time)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((object) => {
      if (object.x) {
        node.position.x = object.x;
      }
      if (object.y) {
        node.position.y = object.y;
      }
      if (object.z) {
        node.position.z = object.z;
      }
    })
    .start();
}

function updateRotationTween(from, to, time, node) {
  new TWEEN.Tween(from)
    .to(to, time)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((object) => {
      if (object.x) {
        node.rotation.x = object.x;
      }
      if (object.y) {
        node.rotation.y = object.y;
      }
      if (object.z) {
        node.rotation.z = object.z;
      }
    })
    .start();
}

const jump = async () => {
  hovering = false;
  const JUMP_HEIGHT = 1.5;
  spaceship.forEach((n) => {
    const from = { y: n.position.y };
    const to = { y: n.position.y + JUMP_HEIGHT };
    updateTween(from, to, 500, n);
    updateRotationTween({ z: 0 }, { z: .75 }, 400, n);
  });
  alien.forEach((n) => {
    const from = { y: n.position.y };
    const to = { y: n.position.y + JUMP_HEIGHT };
    updateTween(from, to, 500, n);
  });

  setTimeout(() => {
    spaceship.forEach((n, i) => {
      updateRotationTween({ z: .75 }, { z: -.5 }, 400, n);
    });
  }, 400);
  setTimeout(() => {
    spaceship.forEach((n, i) => {
      updateRotationTween({ z: -.5 }, { z: 0 }, 400, n);
    });
  }, 800);

  setTimeout(() => {
    spaceship.forEach((n, i) => {
      const updatedFrom = { y: n.position.y };
      const to = { y: n.position.y - JUMP_HEIGHT };
      updateTween(updatedFrom, to, 500, n);
    });
    alien.forEach((n) => {
      const updatedFrom = { y: n.position.y };
      const to = { y: n.position.y - JUMP_HEIGHT };
      updateTween(updatedFrom, to, 500, n);
    });
  }, 500);

  setTimeout(() => {
    hovering = true;
  }, 1000);
};

const spin = () => {
  spaceship.forEach((n) => {
    updateRotationTween({ y: n.rotation.y }, { y: n.rotation.y + Math.PI }, 400, n);
  });
  alien.forEach((n) => {
    if(n.name === "Cone") {
      const JUMP_HEIGHT = 1
      const from = { y: n.position.y };
      const to = { y: n.position.y + JUMP_HEIGHT };
      updateTween(from, to, 500, n);

      setTimeout(() => {
        const from = { y: n.position.y };
        const to = { y: n.position.y - JUMP_HEIGHT };
        updateTween(from, to, 500, n);
      }, 500)
    }
  });
}

const onKeyDown = (e) => {
  let time = 600;
  const keyCode = e.which;
  console.log(keyCode)
  if (keyCode === 38) {
    jump();
    return;
  }
  if (keyCode === 32) {
    spin();
    return;
  }
  spaceship.forEach((n) => {
    const targetPosition = { x: n.position.x };
    if (keyCode === 37) {
      targetPosition.x = n.position.x - 1;
      spaceship.forEach((n, i) => {
        updateRotationTween({ z: 0 }, { z: -.5 }, 400, n);
      });
      setTimeout(() => {
        spaceship.forEach((n, i) => {
          updateRotationTween({ z: -.5 }, { z: 0 }, 400, n);
        });
      }, 400)
    }
    if (keyCode === 39) {
      targetPosition.x = n.position.x + 1;
      spaceship.forEach((n, i) => {
        updateRotationTween({ z: 0 }, { z: .5 }, 400, n);
      });
      setTimeout(() => {
        spaceship.forEach((n, i) => {
          updateRotationTween({ z: .5 }, { z: 0 }, 400, n);
        });
      }, 400)
    }
    if (keyCode === 40) {
      targetPosition.x = 0;
      time = 1500;
    }
    updateTween(n.position, targetPosition, time, n);
  });
  alien.forEach((n) => {
    const targetPosition = { x: n.position.x };
    if (keyCode === 37) {
      targetPosition.x = n.position.x - 1;
    }
    if (keyCode === 39) {
      targetPosition.x = n.position.x + 1;
    }
    if (keyCode === 40) {
      targetPosition.x = 0;
      time = 1500;
    }
    updateTween(n.position, targetPosition, time, n);
  });
};
document.addEventListener("keydown", onKeyDown, false);

tick();
