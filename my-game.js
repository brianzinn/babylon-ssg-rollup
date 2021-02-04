
function loadGame() {
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);
  var scene = new BABYLON.Scene(engine);

  // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
  var camera = new BABYLON.FreeCamera('camera', new BABYLON.Vector3(0, 5, -10), scene);

  // Target the camera to scene origin.
  camera.setTarget(BABYLON.Vector3.Zero());

  // Attach the camera to the canvas.
  camera.attachControl(canvas, false);

  // Create a basic light, aiming 0,1,0 - meaning, to the sky.
  var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7

  // Create a built-in "sphere" shape. 
  var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', { segments: 16, diameter: 2 }, scene);

  // Move the sphere upward 1/2 of its height.
  sphere.position.y = 1;

  // Create a built-in "ground" shape.
  var ground = BABYLON.MeshBuilder.CreateGround('ground1', { height: 6, width: 6, subdivisions: 2 }, scene);

  // some material for the ground.
  var grass0 = new BABYLON.CustomMaterial("grass0", scene);
  grass0.diffuseTexture = new BABYLON.Texture("/textures/grass.png", scene);
  ground.material = grass0;

  grass0.Fragment_Definitions(`
        #define TAU 6.28318530718
        #define MAX_ITER 5
        #define SPEED 0.3
        #define SCALE 30.0

        vec4 caustic(vec2 uv) {
            vec2 p = mod(uv*TAU, TAU)-250.0;
            float t = time * SPEED + 23.0;

            vec2 i = vec2(p);
            float c = 1.0;
            float inten = .005;

            for (int n = 0; n < MAX_ITER; n++) {
                float t = t * (1.0 - (3.5 / float(n+1)));
                i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
                c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
            }

            c /= float(MAX_ITER);
            c = 1.17-pow(c, 1.4);
            vec3 color = vec3(pow(abs(c), 8.0));
            color = clamp(color + vec3(0.0, 0.0, 0.0), 0.0, 1.0);

            float contrast=0.0;
            color = mix(color, vec3(1.0,1.0,1.0),contrast);
            vec4 color4 = vec4(color,0.0);

            return color4;
        }
    `);

  grass0.Fragment_Before_Fog(`
        vec2 coord = vec2(fract(vPositionW.x/SCALE), fract(vPositionW.z/SCALE));
        vec4 causticColor = clamp(caustic(vDiffuseUV), 0.0, 0.5);
        color = vec4(clamp(mix(color, causticColor, 0.5), 0.0, 1.0).rgb, 1.0);
    `);

  grass0.AddUniform('time', 'float');

  const startTime = new Date();

  grass0.onBindObservable.add(function () {
    const endTime = new Date();
    const timeDiff = (endTime - startTime) / 1000.0; // in s
    grass0.getEffect().setFloat('time', timeDiff);
  });

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
}

window.addEventListener('DOMContentLoaded', loadGame);