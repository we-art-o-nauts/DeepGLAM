import './style.css'
import * as THREE from 'three'
import studio from '@theatre/studio'
import { getProject } from '@theatre/core'
import { FontLoader } from './addons/loaders/FontLoader.js'

/**
 * Configuratoin
 */

const DEEP_YEARS = [ 
  2015, 2016, 2017,
  2018, 2019, 2020, 
  2021, 2022, 2023 // , 2024 
].reverse()
const PARSECS_PER_YEAR = 1000

const MAPS_BASE = '/data/2024/'
const MAPS_HISTORIC = [
  'map01-1864', 
  'map02-1894', 
  'map02-1914', 
  'map05-1994', 
  'map08-2024'
]
const MAPS_SATELLITE = [
  // TODO: add clouds
  'mapS1', 'mapS2', 'mapS3', 'mapS4'
]
const projectState = {
  "sheetsById": {
    "Intro": {
      "staticOverrides": {
        "byObject": {
          "Camera": {
            "position": {
              "z": -2191
            }
          }
        }
      },
      "sequence": {
        "subUnitsPerUnit": 30,
        "length": 600,
        "type": "PositionalSequence",
        "tracksByObject": {
          "Camera": {
            "trackData": {
              "APVVYoKBw-": {
                "type": "BasicKeyframedTrack",
                "__debugName": "Camera:[\"position\",\"z\"]",
                "keyframes": [
                  {
                    "id": "GUq4K_HF28",
                    "position": 0,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 107
                  },
                  {
                    "id": "xXqJPH2rmR",
                    "position": 10.033,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 63.362289250138474
                  },
                  {
                    "id": "wHFrqzYRme",
                    "position": 26.233,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -103.25790726995105
                  },
                  {
                    "id": "D692Ge5fY7",
                    "position": 43.8,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -634.808228750981
                  },
                  {
                    "id": "altmA_7KA-",
                    "position": 61.533,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -836.889932406351
                  },
                  {
                    "id": "y3R1ecLf4Y",
                    "position": 540.8,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -9819
                  },
                  {
                    "id": "R7wY5tXzFT",
                    "position": 585.367,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": 350.1922329467529
                  },
                  {
                    "id": "P62_ie4WC0",
                    "position": 600,
                    "connectedRight": true,
                    "handles": [
                      0.5,
                      1,
                      0.5,
                      0
                    ],
                    "type": "bezier",
                    "value": -130
                  }
                ]
              }
            },
            "trackIdByPropPath": {
              "[\"position\",\"z\"]": "APVVYoKBw-"
            }
          }
        }
      }
    }
  },
  "definitionVersion": "0.4.0",
  "revisionHistory": [
    "KUpfi1zWbmhu5wCA",
    "SsrhEtPoOlQReG7I"
  ]
}


/**
 * Theatre.js set up
 */

studio.initialize()
const project = getProject('DeepGLAM', {
  state: projectState
})

const scene = new THREE.Scene()

/**
 * Scene: intro
 */

const sheetI = project.sheet('Intro')

const meshyHistory: THREE.Mesh[] = []
MAPS_HISTORIC.forEach((map, index) => {
  const texture = new THREE.TextureLoader().load(MAPS_BASE + map + '.jpg')
  const geometry = new THREE.PlaneGeometry(130, 90, 130, 90)
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const mesh2 = new THREE.Mesh(geometry, material)
  mesh2.position.set(0, 0, 300 + index * -60)
  meshyHistory.push(mesh2)
  scene.add(mesh2)
})
const meshyMaps: THREE.Mesh[] = []
MAPS_SATELLITE.forEach((map, index) => {
  const texture = new THREE.TextureLoader().load(MAPS_BASE + map + '.jpg')
  const geometry = new THREE.PlaneGeometry(130, 90, 130, 90)
  const material = new THREE.MeshBasicMaterial({ map: texture })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, index * -30)
  meshyMaps.push(mesh)
  scene.add(mesh)
})

/**
 * Main loop for years
 */

// A nice plain white
const m_default = new THREE.MeshStandardMaterial({ color: '#fff' })
const m_black = new THREE.MeshStandardMaterial({ color: '#000' })

// A nice vector font
const loader = new FontLoader();
loader.load('/fonts/AmpleSoft_Pro_Regular_Regular.json', function (font) {

  for (let yyy = 0; yyy < DEEP_YEARS.length; yyy++) {

    const year = DEEP_YEARS[yyy]
    const year_parsec = -(PARSECS_PER_YEAR + PARSECS_PER_YEAR * yyy)
    const sheetY = project.sheet('Year ' + year)
    const year_data = 'data/' + year + '/'

    // Create objects for projects
    fetch(year_data + 'projects.json')
    .then(response => response.json())
    .then(data => {
      data.projects.forEach((project, index) => {
          // Add the year's map and text
          const yearShape = new THREE.ShapeGeometry(font.generateShapes('' + year, 20))
          const yearMesh = new THREE.Mesh(yearShape, m_black)
          yearMesh.position.set(-54, -43, year_parsec + 301)
          yearMesh.material.opacity = 0.5
          scene.add(yearMesh)
          const mapTexture = new THREE.TextureLoader().load(year_data + 'map.jpg')
          const mapGeometry = new THREE.PlaneGeometry(126, 90, 126, 90)
          const mapMaterial = new THREE.MeshBasicMaterial({ map: mapTexture })
          const mapMesh = new THREE.Mesh(mapGeometry, mapMaterial)
          mapMesh.position.set(0, 0, year_parsec + 300)
          scene.add(mapMesh)

          // Position the things in space
          const x = -50 + Math.random() * 100
          const y = -40 + Math.random() * 80
          const z = year_parsec + index * -20
          
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
            (year_parsec + index * -20) + (Math.random() * 500)
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
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  10,
  200,
)
const cameraFlyObj = sheetI.object('Camera', {
  position: { x: 0, y: 0, z: 64 }
})

const $year = document.getElementById('year')

cameraFlyObj.onValuesChange((values) => {
  const { x, y, z } = values.position
  camera.position.set(x, y, z)
  if (z > 0) {    
    // Fade the maps into each other
    meshyMaps.forEach((map, index) => {
      const distance = Math.abs(map.position.z - z)
      map.material.transparent = true
      map.material.opacity = (distance > 30) ? 1.0 : (distance / 20)
    })
    $year.innerHTML = ''
  } else {
    const index = Math.round((-100-z) / PARSECS_PER_YEAR) - 1
    if (index >= 0 && index < DEEP_YEARS.length) {
      const the_year = DEEP_YEARS[index]
      $year.innerHTML = the_year + ''
      const year_data = 'data/' + the_year + '/'

      // Load and play some audio
      sheetI.sequence.attachAudio({ source: year_data + 'audio.ogg' }).then(() => {
        console.log('Audio loaded', the_year)
      })

    } else {
      $year.innerHTML = ''
    }
  }
})

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
