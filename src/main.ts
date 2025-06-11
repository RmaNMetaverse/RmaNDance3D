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
  private alertElement: HTMLElement;

  constructor() {
    console.log('Initializing DanceApp...');
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

    // Get alert element
    this.alertElement = document.querySelector('.alert') as HTMLElement;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    console.log('Scene setup complete, loading model...');
    // Load initial model and setup event listeners
    this.loadModel();
    this.setupEventListeners();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private showAlert(message: string, type: string = 'info') {
    this.alertElement.textContent = message;
    this.alertElement.className = `alert alert-${type} mb-3`;
    this.alertElement.style.display = 'block';
    this.alertElement.style.width = 'fit-content';
    this.alertElement.style.marginLeft = 'auto';
    this.alertElement.style.marginRight = 'auto';
    setTimeout(() => {
      this.alertElement.style.display = 'none';
    }, 3000);
  }

  private async loadModel() {
    const loader = new GLTFLoader();
    const modelPath = './assets/RmaNIdle.glb';
    console.log('Attempting to load model from:', modelPath);
    
    try {
      // Load idle animation
      const gltf = await loader.loadAsync(modelPath);
      console.log('Model loaded successfully:', gltf);
      
      this.scene.add(gltf.scene);
      console.log('Model added to scene');

      // Setup animation mixer
      this.mixer = new THREE.AnimationMixer(gltf.scene);
      this.idleAnimation = this.mixer.clipAction(gltf.animations[0]);
      this.idleAnimation.play();
      console.log('Idle animation started');
      this.showAlert('Idle animation loaded successfully', 'success');
    } catch (error: any) {
      console.error('Error loading model:', error);
      console.error('Full error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        name: error?.name || 'Unknown error type'
      });
      this.showAlert('Error loading model', 'danger');
    }
  }

  private async playDanceAnimation(danceNumber: string) {
    if (!this.mixer) {
      console.error('Mixer not initialized');
      this.showAlert('Animation system not initialized', 'danger');
      return;
    }

    // Handle idle animation
    if (danceNumber === 'idle') {
      if (this.currentAnimation) {
        this.currentAnimation.stop();
      }
      if (this.idleAnimation) {
        this.idleAnimation.play();
        this.showAlert('Playing idle animation', 'success');
      }
      return;
    }

    const loader = new GLTFLoader();
    const dancePath = `./assets/RmaNDance${danceNumber}.glb`;
    console.log('Attempting to load dance animation from:', dancePath);
    
    try {
      const gltf = await loader.loadAsync(dancePath);
      console.log('Dance model loaded successfully:', gltf);
      
      // Stop current animation
      if (this.currentAnimation) {
        this.currentAnimation.stop();
      }

      // Play new dance animation
      this.currentAnimation = this.mixer.clipAction(gltf.animations[0]);
      this.currentAnimation.play();
      console.log('Dance animation started');
      this.showAlert(`Dance ${danceNumber} started`, 'success');

      // When dance animation finishes, return to idle
      this.currentAnimation.clampWhenFinished = true;
      this.currentAnimation.loop = THREE.LoopOnce;
      this.currentAnimation.reset();

      // Set up animation completion callback using the mixer's event system
      const onAnimationFinished = () => {
        console.log('Dance animation finished, returning to idle');
        if (this.idleAnimation) {
          this.idleAnimation.play();
        }
        this.showAlert('Returning to idle animation', 'info');
      };

      // Add the event listener to the mixer instead of the animation
      this.mixer.addEventListener('finished', onAnimationFinished);
    } catch (error: any) {
      console.error(`Error loading dance animation ${danceNumber}:`, error);
      console.error('Full error details:', {
        message: error?.message || 'Unknown error',
        stack: error?.stack || 'No stack trace',
        name: error?.name || 'Unknown error type'
      });
      this.showAlert(`Error loading dance ${danceNumber}`, 'danger');
    }
  }

  private setupEventListeners() {
    const buttons = document.querySelectorAll('.dance-button');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const danceNumber = (e.target as HTMLElement).getAttribute('data-dance');
        if (danceNumber) {
          console.log('Dance button clicked:', danceNumber);
          this.playDanceAnimation(danceNumber);
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
console.log('Starting application...');
new DanceApp(); 