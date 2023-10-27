import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

  function loadModels() {
  return new Promise( async (resolve) => {
    const loader = new GLTFLoader();
    // const loadedD = await loader.load("spaceship.glb");
    // const loader = new GLTFLoader();
    loader.load("spaceship.glb", (loadedD) => {
      console.log(loadedD)
        resolve(loadedD);
    }, undefined, (error) => {
      console.error("Error loading spaceship.glb:", error);
  });
    // resolve(loadedD)
  });
}

function loadWorld(){
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
      loader.load("world.glb", (worldD) => {
        resolve(worldD);
    });
  });
}

async function main() {
  THREE.ColorManagement.enabled = false;
  // Debug
  const gui = new dat.GUI();
  const loadedData = await loadModels();
  const worldData = await loadWorld();
  const spaceship = new THREE.Group();
  loadedData.scene.children.forEach(n => spaceship.add(n))
  const alien = [loadedData.scene.children[0]];
  const world = worldData.scene.children[0];

  const canvas = document.querySelector("canvas.webgl");
  const scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  gui.add(ambientLight, "intensity").min(0).max(1).step(0.01);

  // moderatet
  const directionalLight = new THREE.DirectionalLight(0x00ff00, 0.5);
  scene.add(directionalLight);
  // gui.add(directionalLight, "intensity").min(0).max(1).step(0.01);
  // cheap
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
  hemisphereLight.position.set(0, 300, 0);
  scene.add(hemisphereLight);
  // gui.add(hemisphereLight, "intensity", 0, 1, 0.01);
  // moderatet
  const pointLight = new THREE.PointLight(0xff9000, 1, 0);
  pointLight.position.set(1, 0, 4);
  scene.add(pointLight);
  // gui.add(pointLight, "intensity", 0, 1, 0.01);
  // gui.add(pointLight, "distance", 0, 1, 0.01);

    spaceship.scale.x = 0.5
    spaceship.scale.y = 0.5
    spaceship.scale.z = 0.5
    spaceship.position.z += 5;
    scene.add(spaceship);
  world.scale.x = 6;
  world.scale.y = 6;
  world.scale.z = 6;
  world.position.y = -12.5;
  scene.add(world);

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

  const clock = new THREE.Clock();
  let hovering = true;

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    world.rotation.x = 0.5 * elapsedTime;
    // directionalLight.intensity = Math.cos(elapsedTime);

    if (hovering) {
      hover(elapsedTime);
    }
    handleCollision();

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
    TWEEN.update();
  };

  function handleCollision(){
    return;
    const worldBB = new THREE.Box3().setFromObject(world);
    spaceship.forEach(n => {
      const sshipBB = new THREE.Box3().setFromObject(n);
      const collision = sshipBB.intersectsBox(worldBB);
      // console.log("collision", collision)
      if(collision){
        // console.warn("hit")
      }
    })
  }

  function hover(elapsedTime) {
    [spaceship].concat(...alien).forEach((n) => {
      const currentPosition = n.position.y;
      n.position.y = currentPosition + Math.cos(elapsedTime) * 0.005;
    });
  }

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
    const JUMP_HEIGHT = 2;
    // spaceship.forEach((n) => {
      const from = { y: spaceship.position.y };
      const to = { y: spaceship.position.y + JUMP_HEIGHT };
      updateTween(from, to, 600, spaceship);
      updateRotationTween({ z: 0 }, { z: 0.75 }, 400, spaceship);
    // });
    alien.forEach((n) => {
      const from = { y: n.position.y };
      const to = { y: n.position.y + JUMP_HEIGHT };
      updateTween(from, to, 600, n);
    });

    setTimeout(() => {
      const updatedFrom = { y: spaceship.position.y };
      const to = { y: spaceship.position.y - JUMP_HEIGHT };
      updateTween(updatedFrom, to, 500, spaceship);

      alien.forEach((n) => {
        const updatedFrom = { y: n.position.y };
        const to = { y: n.position.y - JUMP_HEIGHT };
        updateTween(updatedFrom, to, 500, n);
      });
    }, 600);

    setTimeout(() => {
        updateRotationTween({ z: 0.75 }, { z: -0.5 }, 400, spaceship);
    }, 400);
    setTimeout(() => {
        updateRotationTween({ z: -0.5 }, { z: 0 }, 400, spaceship);
    }, 800);

    setTimeout(() => {
      hovering = true;
    }, 1200);
  };

  const spin = () => {
      updateRotationTween(
        { y: spaceship.rotation.y },
        { y: spaceship.rotation.y + Math.PI },
        400,
        spaceship
      );
    alien.forEach((n) => {
      if (n.name === "Cone") {
        const JUMP_HEIGHT = 1;
        const from = { y: n.position.y };
        const to = { y: n.position.y + JUMP_HEIGHT };
        updateTween(from, to, 500, n);

        setTimeout(() => {
          const from = { y: n.position.y };
          const to = { y: n.position.y - JUMP_HEIGHT };
          updateTween(from, to, 500, n);
        }, 500);
      }
    });
  };

  const loop = () => {
      updateRotationTween(
        { x: spaceship.rotation.x },
        { x: spaceship.rotation.x + Math.PI * 2 },
        600,
        spaceship
      );
    alien.forEach(n => {
      updateRotationTween(
        { x: n.rotation.x },
        { x: n.rotation.x + Math.PI * 2 },
        600,
        n
      );
    })
  }

  const onKeyDown = (e) => {
    let time = 600;
    const keyCode = e.which;
    if (keyCode === 38) {
      jump();
      return;
    }
    if (keyCode === 32) {
      spin();
      return;
    }
    if (keyCode === 40) {
      loop();
      return;
    }
    

      const targetPosition = { x: spaceship.position.x };
      if (keyCode === 37) {
        targetPosition.x = spaceship.position.x - 1.5;
          updateRotationTween({ z: 0 }, { z: -0.5 }, 400, spaceship);
        setTimeout(() => {
            updateRotationTween({ z: -0.5 }, { z: 0 }, 400, spaceship);
        }, 400);
      }
      if (keyCode === 39) {
        targetPosition.x = spaceship.position.x + 1.5;
          updateRotationTween({ z: 0 }, { z: 0.5 }, 400, spaceship);
        setTimeout(() => {
            updateRotationTween({ z: 0.5 }, { z: 0 }, 400, spaceship);
        }, 400);
      }
      updateTween(spaceship.position, targetPosition, time, spaceship);

    alien.forEach((n) => {
      const targetPosition = { x: n.position.x };
      if (keyCode === 37) {
        targetPosition.x = n.position.x - 1.5;
      }
      if (keyCode === 39) {
        targetPosition.x = n.position.x + 1.5;
      }
      updateTween(n.position, targetPosition, time, n);
    });
  };
  document.addEventListener("keydown", onKeyDown, false);

  tick();
}

(async () => {
  await main();
})();
