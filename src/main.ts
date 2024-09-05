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

const scene = new THREE.Scene()

/**
 * Scene: intro
 */

const sheetI = project.sheet('Intro')

const MAPS_BASE = '/data/2024/'
const MAPS_HISTORIC = [
  'map01-1864', 
  'map02-1894', 
  'map02-1914', 
  'map05-1994', 
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

  const a_fly2 = sheetI.object('Map H ' + map, {
    position: { x: 0, y: 0, z: 300 + index * -60 }
  })
  a_fly2.onValuesChange((values) => {
    const { x, y, z } = values.position
    mesh2.position.set(x, y, z)
  })
})
const MAPS_SATELLITE = [
  // TODO: add clouds
  'mapS1', 'mapS2', 'mapS3', 'mapS4'
]
const meshyMaps: THREE.Mesh[] = []
MAPS_SATELLITE.forEach((map, index) => {
  const texture = new THREE.TextureLoader().load(MAPS_BASE + map + '.jpg')
  const geometry = new THREE.PlaneGeometry(130, 90, 130, 90)
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const mesh = new THREE.Mesh(geometry, material)
  meshyMaps.push(mesh)
  scene.add(mesh)

  const a_fly = sheetI.object('Map ' + map, {
    position: { x: 0, y: 0, z: index * -30 }
  })
  a_fly.onValuesChange((values) => {
    const { x, y, z } = values.position
    mesh.position.set(x, y, z)
  })
})

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
const cameraFlyObj = sheetI.object('Camera', {
  position: { x: 0, y: 0, z: 50 }
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


const DEEP_YEARS = [ 2015, 2016, 2017
 // 2018, 2019, 2020, 2021, 2022, 2023 // , 2024 
]

/**
 * Main loop for years
 */

const loader = new FontLoader();
loader.load('/fonts/AmpleSoft_Pro_Regular_Regular.json', function (font) {
  for (let yyy = 0; yyy < DEEP_YEARS.length; yyy++) {

    const year = DEEP_YEARS[yyy]
    const sheetY = project.sheet('Year ' + year)

    // Create objects for projects
    const year_data = 'data/' + year + '/'
    fetch(year_data + 'projects.json')
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
            let filename = project.image_url.split('/').pop().split(':').pop()
            const imgurl = year_data + 'images/' + filename
            loader.load(imgurl,
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

    }) // -loader

  } // -each year
}) // -fetch font


/*
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight('#ffffff', 1.0)
scene.add(ambientLight)

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
