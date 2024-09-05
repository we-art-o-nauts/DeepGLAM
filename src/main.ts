import './style.css'
import * as THREE from 'three'
import studio from '@theatre/studio'
import { getProject } from '@theatre/core'
import { FontLoader } from './addons/loaders/FontLoader.js'

/**
 * Theatre.js
 */

studio.initialize()
const project = getProject('DeepGLAM')
const sheet1 = project.sheet('Intro')

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  10,
  200,
)
camera.position.z = 50

const cameraFlyObj = sheet1.object('Camera', {
  position: { x: 0, y: 0, z: 50 }
})



/**
 * Scene: intro
 */

const scene = new THREE.Scene()

const MAPS_BASE = '/swisstopo/'
const MAPS_HISTORIC = [
  'map01-1864', 
  //'map02-1894', 'map02-1914', 'map03-1944', 'map04-1974', 
  'map05-1994', 
  //'map06-2004', 'map07-2014', 
  'map08-2024'
]

const meshyHistory: THREE.Mesh[] = []
MAPS_HISTORIC.forEach((map, index) => {
  const texture = new THREE.TextureLoader().load(MAPS_BASE + map + '.jpg')
  const geometry = new THREE.PlaneGeometry(130, 90, 130, 90)
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const mesh2 = new THREE.Mesh(geometry, material)
  meshyHistory.push(mesh2)
  scene.add(mesh2)

  const a_fly2 = sheet1.object('Map H ' + map, {
    position: { x: 0, y: 0, z: 300 + index * -60 }
  })
  a_fly2.onValuesChange((values) => {
    const { x, y, z } = values.position
    mesh2.position.set(x, y, z)
  })
})


const MAPS_SATELLITE = [
  'mapS1', 'mapS2', 'mapS3', 'mapS4'
]
const meshyMaps: THREE.Mesh[] = []
MAPS_SATELLITE.forEach((map, index) => {
  const texture = new THREE.TextureLoader().load(MAPS_BASE + map + '.jpg')
  const geometry = new THREE.PlaneGeometry(130, 90, 130, 90)
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const mesh = new THREE.Mesh(geometry, material)
  /*
  const wireframe = new THREE.WireframeGeometry(geometry);
  const line = new THREE.LineSegments(wireframe, material);
  line.material.depthTest = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;
  */
  meshyMaps.push(mesh)
  scene.add(mesh)

  const a_fly = sheet1.object('Map ' + map, {
    position: { x: 0, y: 0, z: index * -30 }
  })
  a_fly.onValuesChange((values) => {
    const { x, y, z } = values.position
    mesh.position.set(x, y, z)
  })
})

cameraFlyObj.onValuesChange((values) => {
  const { x, y, z } = values.position
  camera.position.set(x, y, z)

  meshyMaps.forEach((map, index) => {
    const distance = Math.abs(map.position.z - z)
    map.material.transparent = true
    map.material.opacity = (distance > 30) ? 1.0 : (distance / 20)
  })
})

const loader = new FontLoader();
loader.load('/fonts/AmpleSoft_Pro_Regular_Regular.json', function (font) {

  // Create objects for projects
  fetch('/projects.json')
  .then(response => response.json())
  .then(data => {
    data.projects.forEach((project, index) => {
        // Default white
        const m_default = new THREE.MeshStandardMaterial({ color: '#fff' })
        // Position the things in space
        const x = -50 + Math.random() * 100
        const y = -40 + Math.random() * 80
        const z = -600 + index * -20
        
        if (!project.image_url) {
          // Boxes for projects (hexagons would be nicer)
          const a_box = new THREE.BoxGeometry(5, 5)
          const a_mesh = new THREE.Mesh(a_box, m_default)
          a_mesh.position.set(x, y, z)
          scene.add(a_mesh)
        } else {
          const loader = new THREE.TextureLoader()
          loader.load(
            project.image_url,
          (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(texture.image.height / texture.image.width, 1)
            const a_material = new THREE.MeshBasicMaterial({ map: texture })
            const a_circle = new THREE.CircleGeometry(10, 6)
            const a_mesh = new THREE.Mesh(a_circle, a_material)
            a_mesh.position.set(x - 7, y - 1, z - 1)
            scene.add(a_mesh)
          })
        }

        // Bubbles for activities (currently random)
        const matLine = new THREE.LineBasicMaterial({
          color: '#fff'
        });
        const a_circle = new THREE.CircleGeometry(Math.random() * 30, 40)
        const wireframe = new THREE.WireframeGeometry(a_circle);
        const line = new THREE.LineSegments(wireframe, matLine);
        line.material.depthTest = false;
        line.material.opacity = 0.2;
        line.material.transparent = true;
        line.position.set(
          -50 + Math.random() * 100,
          -40 + Math.random() * 80,
          (-600 + index * -20) + (Math.random() * 500)
        )
        scene.add(line)

        const msg = project.name
        const msgShape = new THREE.ShapeGeometry(font.generateShapes(msg, 3))
        const msgMesh = new THREE.Mesh(msgShape, m_default)
        msgMesh.position.set(x + 8, y - 3, z)
        scene.add(msgMesh)
      }) // -forEach
    }) // -fetch

}) // -loader


/*
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight('#ffffff', 1.0)
scene.add(ambientLight)

/*
 * TorusKnot
const geometry = new THREE.TorusKnotGeometry(10, 3, 300, 16)
const material = new THREE.MeshStandardMaterial({color: '#f00'})
material.color = new THREE.Color('#049ef4')
material.roughness = 0.5

const mesh = new THREE.Mesh(geometry, material)
mesh.castShadow = true
mesh.receiveShadow = true
scene.add(mesh)


// Point light
const directionalLight = new THREE.DirectionalLight('#ff0000', 30)
directionalLight.position.y = 20
directionalLight.position.z = 20

directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.far = 50
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.top = 20
directionalLight.shadow.camera.right = 20
directionalLight.shadow.camera.bottom = -20
directionalLight.shadow.camera.left = -20

scene.add(directionalLight)

// RectAreaLight
const rectAreaLight = new THREE.RectAreaLight('#ff0', 1, 50, 50)

rectAreaLight.position.z = 10
rectAreaLight.position.y = -40
rectAreaLight.position.x = -20
rectAreaLight.lookAt(new THREE.Vector3(0, 0, 0))

scene.add(rectAreaLight)

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({antialias: true})

renderer.shadowMap.enabled = false
//renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)

document.body.appendChild(renderer.domElement)

/**
 * Update the screen
 */
function tick(): void {
  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}

tick()

/**
 * Handle `resize` events
 */
window.addEventListener(
  'resize',
  function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  },
  false,
)
