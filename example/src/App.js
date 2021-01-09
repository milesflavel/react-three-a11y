import * as THREE from "three"
import React, { Suspense, useLayoutEffect, useMemo, useRef } from "react"
import { Canvas, useThree, useFrame } from "react-three-fiber"
import { Environment } from "@react-three/drei/Environment"
import { Loader, useTexture, useGLTF, Shadow } from "@react-three/drei"
import { useTransition, useSpring } from "@react-spring/core"
import { a } from "@react-spring/three"
import { useLocation, Switch, Route } from "wouter"
import DistortionMaterial from "./DistortionMaterial"
import { Container, Jumbo, Nav, Box, Line, Cover } from "./Styles"
import { A11yDom, FocusHelper, ScreenReaderHelper, A11y, useA11y } from "../../."
import textureimg1 from "../public/ao.jpg"
import textureimg2 from "../public/normal.jpg"
import textureimg3 from "../public/height.png"
import textureimg4 from "../public/roughness.jpg"

const torus = new THREE.TorusBufferGeometry(4, 1.2, 128, 128)
const torusknot = new THREE.TorusKnotBufferGeometry(3, 0.8, 256, 16)
const sphere = new THREE.SphereBufferGeometry(5, 32, 32)
const material1 = new DistortionMaterial()
const material2 = new DistortionMaterial()
const material3 = new DistortionMaterial()
const jumbo = {
  "/": ["The sun", "is its father."],
  "/knot": ["The moon", "its mother."],
  "/bomb": ["The wind", "hath carried it", "in its belly."],
}

const BtnBox = props => {
  const mesh = useRef()
  const a11yContext = useA11y()

  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    //@ts-ignore
    if (mesh.current) mesh.current.rotation.x = mesh.current.rotation.y += 0.01
  })

  console.log("box render")

  return (
    <mesh {...props} ref={mesh}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={
          // @ts-ignore
          a11yContext.focus ||
          // @ts-ignore
          a11yContext.hover
            ? // @ts-ignore
              "blue"
            : "orange"
        }
      />
    </mesh>
  )
}

function Shape({ geometry, material, args, textures, opacity, color, shadowScale = [9, 1.5, 1], ...props }) {
  const ref = useRef()
  const a11yContext = useA11y()
  const { mouse, clock } = useThree()
  const [ao, normal, height, roughness] = textures
  const [rEuler, rQuaternion] = useMemo(() => [new THREE.Euler(), new THREE.Quaternion()], [])
  useFrame(() => {
    if (ref.current) {
      rEuler.set((-mouse.y * Math.PI) / 10, (mouse.x * Math.PI) / 6, 0)
      ref.current.quaternion.slerp(rQuaternion.setFromEuler(rEuler), 0.1)
      ref.current.material.time = clock.getElapsedTime() * 3
    }
  })
  return (
    <group {...props}>
      <a.mesh
        ref={ref}
        args={args}
        geometry={geometry}
        material={material}
        material-color={a11yContext.focus || a11yContext.hover ? "red" : color}
        material-aoMap={ao}
        material-normalMap={normal}
        material-displacementMap={height}
        material-roughnessMap={roughness}
        material-opacity={opacity}>
        <Shadow opacity={0.2} scale={shadowScale} position={[0, -8.5, 0]} />
      </a.mesh>
    </group>
  )
}

function Shapes({ transition, setLocation }) {
  // const { nodes } = useGLTF("http://127.0.0.1:5500/example/public/bomb-gp.glb")
  const textures = useTexture([textureimg1, textureimg2, textureimg3, textureimg4])
  useLayoutEffect(() => {
    textures.forEach(texture => ((texture.wrapT = texture.wrapS = THREE.RepeatWrapping), texture.repeat.set(4, 4)))
  }, [textures])
  console.log(textures)
  return transition(({ opacity, ...props }, location) => (
    <a.group {...props}>
      <Switch location={location}>
        <Route path="/">
          <A11y
            role="link"
            href="/knot"
            title="Link to knot page"
            actionCall={() => {
              setLocation("/knot")
            }}>
            <Shape geometry={torus} material={material1} textures={textures} color="white" opacity={opacity} />
          </A11y>
          <A11y
            role="button"
            title="Dark mode button theme"
            actionCall={() => console.log("some theme switch function")}
            activationMsg="Theme Dark enabled"
            desactivationMsg="Theme Dark disabled">
            <BtnBox />
          </A11y>
        </Route>
        <Route path="/knot">
          <A11y
            role="link"
            href="/bomb"
            title="Link to bomb page"
            actionCall={() => {
              setLocation("/bomb")
            }}>
            <Shape geometry={torusknot} material={material2} textures={textures} color="#272730" opacity={opacity} />
          </A11y>
          <A11y
            role="button"
            title="press this button to call a console.log"
            actionCall={() => console.log("some console.log")}
            activationMsg="Console.log called">
            <BtnBox />
          </A11y>
        </Route>
        <Route path="/bomb">
          <A11y
            role="link"
            title="back to home page"
            href="/"
            actionCall={() => {
              setLocation("/")
            }}>
            <Shape
              geometry={sphere}
              material={material3}
              textures={textures}
              scale={[0.7, 0.7, 0.7]}
              rotation={[0, 0.5, 0]}
              shadowScale={[17, 2.5, 1]}
              color="black"
              opacity={opacity}
            />
          </A11y>
          <A11y role="content" title="A cube that is like a cube ">
            <BtnBox position={[0, -5, 5]} />
          </A11y>
          <A11y role="content" title="Another cube how fascinating ">
            <BtnBox position={[0, 3, 5]} />
          </A11y>
          <A11y role="content" title="And a third cube">
            <BtnBox position={[0, 5, 5]} />
          </A11y>
        </Route>
      </Switch>
    </a.group>
  ))
}

function Text({ children, opacity, background }) {
  return (
    <Box style={{ opacity }}>
      {React.Children.toArray(children).map((text, index) => (
        <Line key={index} style={{ transform: opacity.to(t => `translate3d(0,${index * -50 + (1 - t) * ((1 + index) * 40)}px,0)`) }}>
          <div>{text}</div>
          <Cover style={{ background, transform: opacity.to(t => `translate3d(0,${t * 100}%,0) rotateZ(-10deg)`) }} />
        </Line>
      ))}
    </Box>
  )
}

export default function App() {
  // Current route
  const [location, setLocation] = useLocation()
  // Animated background color
  const props = useSpring({
    background: location === "/" ? "white" : location === "/knot" ? "#272730" : "#ffcc6d",
    color: location === "/" ? "black" : location === "/knot" ? "white" : "white",
  })
  // Animated shape props
  const transition = useTransition(location, {
    from: { position: [0, 0, -20], rotation: [0, Math.PI, 0], scale: [0, 0, 0], opacity: 0 },
    enter: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1], opacity: 1 },
    leave: { position: [0, 0, -10], rotation: [0, -Math.PI, 0], scale: [0, 0, 0], opacity: 0 },
    config: () => n => n === "opacity" && { friction: 60 },
  })
  return (
    <>
      <FocusHelper />
      <ScreenReaderHelper />
      <Container style={{ ...props }}>
        <Jumbo>
          {transition((style, location) => (
            <Text open={true} t={style.t} opacity={style.opacity} background={props.background} children={jumbo[location]} />
          ))}
        </Jumbo>
      </Container>
      <A11yDom>
        <Canvas concurrent camera={{ position: [0, 0, 20], fov: 50 }} onCreated={({ gl }) => (gl.toneMappingExposure = 1.5)}>
          <spotLight position={[0, 30, 40]} />
          <spotLight position={[-50, 30, 40]} />
          <Suspense fallback={null}>
            <Shapes transition={transition} setLocation={setLocation} />
          </Suspense>
        </Canvas>
      </A11yDom>
      <Nav style={{ color: props.color }} />
      <Loader />
    </>
  )
}
