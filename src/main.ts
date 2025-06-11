import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class DanceApp {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private mixer: THREE.AnimationMixer | null = null;
  private currentAnimation: THREE.AnimationAction | null = null;
  private idleAnimation: THREE.AnimationAction | null = null;
  private clock: THREE.Clock;

  constructor() {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 1.5, 3);

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById('canvas') as HTMLCanvasElement,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Initialize controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 1, 0);

    // Initialize clock for animations
    this.clock = new THREE.Clock();

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Load initial model and setup event listeners
    this.loadModel();
    this.setupEventListeners();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private async loadModel() {
    const loader = new GLTFLoader();
    
    try {
      // Load idle animation
      const idleModel = await loader.loadAsync('./assets/RmaNIdle.glb');
      const model = idleModel.scene;
      this.scene.add(model);

      // Setup animation mixer
      this.mixer = new THREE.AnimationMixer(model);
      this.idleAnimation = this.mixer.clipAction(idleModel.animations[0]);
      this.idleAnimation.play();
    } catch (error) {
      console.error('Error loading model:', error);
    }
  }

  private async playDanceAnimation(danceNumber: number) {
    if (!this.mixer) return;

    const loader = new GLTFLoader();
    try {
      const danceModel = await loader.loadAsync(`./assets/RmaNDance${danceNumber}.glb`);
      
      // Stop current animation
      if (this.currentAnimation) {
        this.currentAnimation.stop();
      }

      // Play new dance animation
      this.currentAnimation = this.mixer.clipAction(danceModel.animations[0]);
      this.currentAnimation.play();

      // When dance animation finishes, return to idle
      this.currentAnimation.clampWhenFinished = true;
      this.currentAnimation.loop = THREE.LoopOnce;
      this.currentAnimation.reset();

      // Set up animation completion callback
      const onAnimationFinished = () => {
        if (this.idleAnimation) {
          this.idleAnimation.play();
        }
      };

      // Add the event listener using type assertion
      if (this.currentAnimation) {
        (this.currentAnimation as any).addEventListener('finished', onAnimationFinished);
      }
    } catch (error) {
      console.error(`Error loading dance animation ${danceNumber}:`, error);
    }
  }

  private setupEventListeners() {
    const buttons = document.querySelectorAll('.dance-button');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const danceNumber = (e.target as HTMLElement).getAttribute('data-dance');
        if (danceNumber) {
          this.playDanceAnimation(parseInt(danceNumber));
        }
      });
    });
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the app
new DanceApp(); 