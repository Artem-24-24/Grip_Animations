import * as THREE from '../libs/three124/three.module.js'
import {VRButton} from "../libs/three124/jsm/VRButton";
import {GLTFLoader} from "../libs/three124/jsm/GLTFLoader";
import {DRACOLoader} from "../libs/three124/jsm/DRACOLoader"

import {XRControllerModelFactory} from "three/examples/jsm/webxr/XRControllerModelFactory";

import blimp from "../assets/Blimp.glb"
import chair from "../assets/medieval-chair.glb"
import knight from "../assets/knight_main.glb"
// import {LoadingBar} from "../libs/LoadingBar";



class App {
  clock = new THREE.Clock();
  world;


  constructor() {
    const container = document.createElement('div')
    document.body.appendChild(container)

    this.camera = new THREE.PerspectiveCamera(50,
        window.innerWidth / window.innerHeight, 0.1, 200)
    this.camera.position.set(0, 1.6, 3)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x505050)

    const ambient = new THREE.HemisphereLight(0x606060, 0x404040, 1)
    this.scene.add(ambient)

    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    this.scene.add(light)

    this.renderer = new THREE.WebGLRenderer({antialias: true})
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.outputEncoding = THREE.sRGBEncoding
    container.appendChild(this.renderer.domElement)

    // this.loadingBar = new LoadingBar();

    this.initScene()
    this.setupVR()

    this.renderer.setAnimationLoop(this.render.bind(this))
    window.addEventListener('resize', this.resize.bind(this))
  }


  initScene() {

    this.loadGLTF(knight);
    //this.loadGLTF( modelFilename );

    const self = this

    const geometry = new THREE.BoxBufferGeometry(.5, .5, .5)
    const material = new THREE.MeshStandardMaterial({color: 0xFF0000})
    this.mesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.mesh)

    const geometrySphere = new THREE.SphereGeometry(.7, 32, 16)
    const materialSphere = new THREE.MeshBasicMaterial({color: 0xffff00})
    const sphere = new THREE.Mesh(geometrySphere, materialSphere)
    this.scene.add(sphere)

    sphere.position.set(1.5, 0, 0)

    // this.loadAsset(blimp, -.5, .5, 1, scene => {
    //   const scale = 5
    //   scene.scale.set(scale, scale, scale)
    //   self.blimp = scene
    // })


    // this.loadAsset(knight, gltf => {
    //   const gltfScene = gltf.scene.children[0]
    //   gltfScene.position.set(0, 0, -5)
    //
    //   self.knight = gltfScene
    //   const scale = .01;
    //   self.knight.scale.set(scale, scale, scale);
    //
    //   self.scene.add(gltfScene)
    //
    //   // animations
    //   self.animations = {};
    //
    //   gltf.animations.forEach((anim) => {
    //     self.animations[anim.name] = anim;
    //   })
    //
    //   self.mixer = new THREE.AnimationMixer(self.knight)
    //   self.action = "Idle";
    // })

    // this.loadAsset(chair, .5, .5, 1, scene => {
    //   const scale = 1
    //   scene.scale.set(scale, scale, scale)
    //   self.chair = scene
    // })

  }

  //loadAsset(gltfFilename,sceneHandler) {
    // const loader = new GLTFLoader()
    // // Provide a DRACOLoader instance to decode compressed mesh data
    // const draco = new DRACOLoader()
    // draco.setDecoderPath('draco/')
    // loader.setDRACOLoader(draco)
    //
    // loader.load(gltfFilename, (gltf) => {
    //
    //       if (sceneHandler) {
    //         sceneHandler(gltf)
    //       }
    //     },
    //     null,
    //     (error) => console.error(`An error happened: ${error}`)
    // )
  //}

  set action(name) {
    if (this.actionName === name) return;

    const clip = this.animations[name];

    if (clip !== undefined) {
      const action = this.mixer.clipAction(clip);

      if (name === 'Idle') {
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
      }

      this.actionName = name;
      if (this.curAction) this.curAction.crossFadeTo(action, 0.5);

      action.enabled = true;
      action.play();

      this.curAction = action;
    }
  }


  setupVR() {
    this.renderer.xr.enabled = true
    document.body.appendChild(VRButton.createButton(this.renderer))
    const grip = this.renderer.xr.getControllerGrip(0)
    grip.add(new XRControllerModelFactory().createControllerModel(grip))
    this.scene.add(grip)
    const grip2 = this.renderer.xr.getControllerGrip(1)
    grip2.add(new XRControllerModelFactory().createControllerModel(grip2))
    this.scene.add(grip2)

    this.grip = grip;
    this.grip2 = grip2;

    this.addActions()

  }

  addActions() {
    const self = this;

    this.grip.addEventListener('selectstart', () => {
      self.action = 'exhausted'
    })

    this.grip.addEventListener('squeezestart', () => {
      self.action = 'walk'
    })

    this.grip2.addEventListener('selectstart', () => {
      self.action = 'kick'
    })

    this.grip2.addEventListener('squeezestart', () => {
      self.action = 'spider'
    })

  }


  loadGLTF(filename){
    const loader = new GLTFLoader( );
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath( 'draco/' );
    loader.setDRACOLoader( dracoLoader );

    const self = this;

    // Load a glTF resource
    loader.load(
        // resource URL
        filename,
        // called when the resource is loaded
        function ( gltf ) {
          self.animations = {};

          gltf.animations.forEach( (anim)=>{
            self.animations[anim.name] = anim;
          })

          self.knight = gltf.scene.children[4];

          self.mixer = new THREE.AnimationMixer( self.knight )

          self.scene.add( self.knight );

           // self.loadingBar.visible = false;

          const scale = 0.01;
          self.knight.scale.set(scale, scale, scale);
          self.action = "waiting";

          self.renderer.setAnimationLoop( self.render.bind(self) );
        },
        // called while loading is progressing
        function ( xhr ) {

          // self.loadingBar.progress = (xhr.loaded / xhr.total);

        },
        // called when loading has errors
        function ( error ) {

          console.log( 'An error happened' );

        }
    );
  }


  animate() {

    renderer.setAnimationLoop(this.render);

  }


  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  render() {
    const delta = this.clock.getDelta();
    // const elapsedTime =  this.clock.elapsedTime;
    //this.renderer.xr.updateCamera( this.camera );
    this.renderer.render(this.scene, this.camera);
    // this.world.execute( delta, elapsedTime );

    if (this.mixer) {
      this.mixer.update(delta)
    }

    this.renderer.render(this.scene, this.camera)
  }
}


    // if (this.blimp) {
    //   this.blimp.rotateY(0.1 * xAxis)
    //   this.blimp.translateY(.02 * yAxis)
    // }


export {App}
