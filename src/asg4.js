// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;

  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_NormalMatrix;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; 
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 1.0)));
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;

  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  uniform bool u_lightON;

  uniform vec3 u_lightColor;

  uniform vec3 u_spotDirection;
  uniform float u_spotCosineCutoff;
  uniform float u_spotExponent;
  uniform bool u_spotlightON;

  void main() {
    if (u_whichTexture == -3) {                     // Use normal color
      gl_FragColor = vec4((v_Normal + 1.0) / 2.0, 1.0);
    } else if (u_whichTexture == -2) {                     // Solid color
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {              // UV Debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {               // texture 0
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {               // texture 1
      gl_FragColor = vec4(0.4, 0.4, 0.4, 1.0) * texture2D(u_Sampler1, v_UV);   
    } else if (u_whichTexture == 2) {               // texture 2
      gl_FragColor = vec4(0.4, 0.4, 0.4, 1.0) * texture2D(u_Sampler2, v_UV);   
    } else if (u_whichTexture == 3) {               // texture 3
      gl_FragColor = texture2D(u_Sampler3, v_UV);   
    } else if (u_whichTexture == 4) {               // texture 4
      gl_FragColor = texture2D(u_Sampler4, v_UV);   
    } else {                                        // Redish for error
      gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos);
    float r = length(lightVector);

    // if (r < 1.2) {
    //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // } else if (r < 2.0) {
    //   gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    // }

    // gl_FragColor = vec4(vec3(gl_FragColor) / (r * r), 1.0);

    // N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N, L), 0.0);

    // Reflection
    vec3 R = reflect(-L, N);

    // Eye
    vec3 E = normalize(u_cameraPos - vec3(v_VertPos));

    // Specular
    float specular = pow(max(dot(R, E), 0.0), 20.0) * 0.9;
    
    // Ambient and Diffuse
    vec3 diffuse = vec3(gl_FragColor) * u_lightColor * nDotL * 0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.25;

    float spotFactor = 1.0;
    if (u_spotlightON) {
      vec3 L = normalize(u_lightPos - vec3(v_VertPos));
      vec3 D = normalize(u_spotDirection);
      float spotCosine = dot(D, -L);
      
      if (spotCosine >= u_spotCosineCutoff) {
        spotFactor = pow(spotCosine, u_spotExponent);
      } else {
        spotFactor = 0.0;
      }
    }
    
    // Apply spotlight factor to your final color
    if (u_lightON) {
      vec3 diffuseWithSpot = diffuse * spotFactor;
      vec3 specularWithSpot = vec3(specular) * spotFactor * u_lightColor;
      gl_FragColor = vec4(specularWithSpot + diffuseWithSpot + ambient, 1.0);
    } else {
      // Your existing no-light case
      gl_FragColor = vec4(diffuse + ambient, 1.0);
    }
  }`

// Global variables
let canvas; 
let gl;
let a_Position;
let a_UV;
let a_Normal;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_NormalMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;
let u_lightPos;
let g_selectedBlockType = 1;
let u_cameraPos;
let u_spotDirection;
let u_spotCosineCutoff;
let u_spotExponent;
let u_spotlightON;
let u_lightColor;


function setupWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer:true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return false;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return false;
  }

  u_lightON = gl.getUniformLocation(gl.program, 'u_lightON');
  if (!u_lightON) {
    console.log('Failed to get the storage location of u_lightON');
    return false;
  }

  u_spotDirection = gl.getUniformLocation(gl.program, 'u_spotDirection');
  if (!u_spotDirection) {
    console.log('Failed to get the storage location of u_spotDirection');
    return false;
  }

  u_spotCosineCutoff = gl.getUniformLocation(gl.program, 'u_spotCosineCutoff');
  if (!u_spotCosineCutoff) {
    console.log('Failed to get the storage location of u_spotCosineCutoff');
    return false;
  }

  u_spotExponent = gl.getUniformLocation(gl.program, 'u_spotExponent');
  if (!u_spotExponent) {
    console.log('Failed to get the storage location of u_spotExponent');
    return false;
  }

  u_spotlightON = gl.getUniformLocation(gl.program, 'u_spotlightON');
  if (!u_spotlightON) {
    console.log('Failed to get the storage location of u_spotlightON');
    return false;
  }

  u_lightColor = gl.getUniformLocation(gl.program, 'u_lightColor');
  if (!u_lightColor) {
    console.log('Failed to get the storage location of u_lightColor');
    return false;
  }

  var identityMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMatrix.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global UI variables
let g_selectedSize = 5; // default point size
let g_selectedSegments = 10; // default number of segments for circle
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; // white
let g_selectedType = POINT; // default shape type
let g_globalAngle = 0; // global rotation angle
let g_headAngle = -2; // head rotation angle
let g_rightArmAngle = 225; // right arm rotation angle
let g_leftArmAngle = 135; // left arm rotation angle
let anim = false; // animation flag
let camera;
let g_normalOn = false; // normal vector flag
let g_lightPos = [0, 1, 1.1];
let g_lightON = true;
let g_spotDirection = [0.0, -1.0, 0.0]; 
let g_spotCosineCutoff = Math.cos(30 * Math.PI / 180); 
let g_spotExponent = 10.0;
let g_spotlightON = false;
let g_lightColor = [1.0, 1.0, 1.0];

// Actions for HTML UI
function addActionsforHtmlUI(){

  // Animation Button Events
  document.getElementById('animationOn').onclick = function() {
    anim = true;  
  };
  document.getElementById('animationOff').onclick = function() {
    anim = false; 
    renderAllShapes(); 
  };

  // Normal Vector Button Events
  document.getElementById('normalOn').onclick = function() {
    g_normalOn = true;
    renderAllShapes();
  };
  document.getElementById('normalOff').onclick = function() {
    g_normalOn = false;
    renderAllShapes();
  }

  // Light Button Events
  document.getElementById('lightOn').onclick = function() {
    g_lightON = true;
  }

  document.getElementById('lightOff').onclick = function() {
    g_lightON = false;
  }

  // Spotlight Button and Slider Events
  document.getElementById('spotlightOn').onclick = function() {
    g_spotlightON = true;
  }

  document.getElementById('spotlightOff').onclick = function() {
    g_spotlightON = false;
  }

  const spotSliderX = document.getElementById('spotlightXSlide');
  const spotDisplayX = document.getElementById('spotlightXValue');
  spotSliderX.addEventListener('mousemove', function() {
    g_spotDirection[0] = this.value/100;
    renderAllShapes();
    spotDisplayX.textContent = this.value/100;
  });

  const spotSliderY = document.getElementById('spotlightYSlide');
  const spotDisplayY = document.getElementById('spotlightYValue');
  spotSliderY.addEventListener('mousemove', function() {
    g_spotDirection[1] = this.value/100;
    renderAllShapes();
    spotDisplayY.textContent = this.value/100;
  });

  const spotSliderZ = document.getElementById('spotlightZSlide');
  const spotDisplayZ = document.getElementById('spotlightZValue');
  spotSliderZ.addEventListener('mousemove', function() {
    g_spotDirection[2] = this.value/100;
    renderAllShapes();
    spotDisplayZ.textContent = this.value/100;
  });

  const spotCutoffSlider = document.getElementById('spotlightCutoffSlide');
  const spotCutoffDisplay = document.getElementById('spotlightCutoffValue');
  spotCutoffSlider.addEventListener('mousemove', function() {
    g_spotCosineCutoff = Math.cos(this.value * Math.PI / 180);
    renderAllShapes();
    spotCutoffDisplay.textContent = this.value +  '°';
  });

  const spotExponentSlider = document.getElementById('spotExponentSlide');
  const spotExponentDisplay = document.getElementById('spotExponentValue');
  spotExponentSlider.addEventListener('mousemove', function() {
    g_spotExponent = this.value;
    renderAllShapes();
    spotExponentDisplay.textContent = this.value;
  });

  // Angle Slider Events
  const angleSlider = document.getElementById('angleSlide');
  const angleDisplay = document.getElementById('angleValue');
  angleSlider.addEventListener('mousemove', function() {
    g_globalAngle = this.value;
    renderAllShapes();
    angleDisplay.textContent = this.value;
  });

  // FOV Slider Events
  const fovSlider = document.getElementById('fovSlide');
  const fovDisplay = document.getElementById('fovValue');
  fovSlider.addEventListener('mousemove', function() {
    camera.updateProjectionMatrix(this.value);
    renderAllShapes();
    fovDisplay.textContent = this.value;
  });

  // Light Color Slider Events
  const lightColorSliderR = document.getElementById('lightRSlide');
  const lightColorDisplayR = document.getElementById('lightRValue');
  lightColorSliderR.addEventListener('mousemove', function() {
    g_lightColor[0] = this.value/100;
    renderAllShapes();
    lightColorDisplayR.textContent = this.value/100;
  });

  const lightColorSliderG = document.getElementById('lightGSlide');
  const lightColorDisplayG = document.getElementById('lightGValue');
  lightColorSliderG.addEventListener('mousemove', function() {
    g_lightColor[1] = this.value/100;
    renderAllShapes();
    lightColorDisplayG.textContent = this.value/100;
  });

  const lightColorSliderB = document.getElementById('lightBSlide');
  const lightColorDisplayB = document.getElementById('lightBValue');
  lightColorSliderB.addEventListener('mousemove', function() {
    g_lightColor[2] = this.value/100;
    renderAllShapes();
    lightColorDisplayB.textContent = this.value/100;
  });

  // Light Position Slider Events
  const lightSliderX = document.getElementById('lightXSlide');
  const lightDisplayX = document.getElementById('lightXValue');
  lightSliderX.addEventListener('mousemove', function() {
    g_lightPos[0] = this.value/100;
    renderAllShapes();
    lightDisplayX.textContent = this.value/100;
  });

  const lightSliderY = document.getElementById('lightYSlide');
  const lightDisplayY = document.getElementById('lightYValue');
  lightSliderY.addEventListener('mousemove', function() {
    g_lightPos[1] = this.value/100;
    renderAllShapes();
    lightDisplayY.textContent = this.value/100;
  });

  const lightSliderZ = document.getElementById('lightZSlide');
  const lightDisplayZ = document.getElementById('lightZValue');
  lightSliderZ.addEventListener('mousemove', function() {
    g_lightPos[2] = this.value/100;
    renderAllShapes();
    lightDisplayZ.textContent = this.value/100;
  });
  
}

function addKeyboardEvents() {
  document.addEventListener('keydown', (ev) => {
    switch(ev.code) {
      case 'KeyW':
        camera.moveForward();
        break;
      case 'KeyS':
        camera.moveBackwards();
        break;
      case 'KeyA':
        camera.moveLeft();
        break;
      case 'KeyD':
        camera.moveRight();
        break;
      case 'KeyQ': 
        camera.panLeft();
        break;
      case 'KeyE': 
        camera.panRight();
        break;
      case 'KeyZ':
        camera.goUp();
        break;
      case 'KeyX':
        camera.goDown();
        break;
      case 'KeyC':
        camera.panUp();
        break;
      case 'KeyV':
        camera.panDown();
        break;
    }
    renderAllShapes();
  });
}

let isDragging = false;
let lastX = -1;
let lastY = -1;

function addMouseEvents() {
  canvas.onmousedown = function(ev) {
    if (ev.buttons === 1) { // Left mouse button
      isDragging = true;
      lastX = ev.clientX;
      lastY = ev.clientY;
    }
  };

  canvas.onmouseup = function(ev) {
    isDragging = false;
  };

  canvas.onmousemove = function(ev) {
    if (isDragging) {
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      
      // Sensitivity factor - adjust as needed
      const sensitivity = 0.3;
      
      // Calculate movement distances
      const moveX = dx * sensitivity;
      const moveY = dy * sensitivity;
      
      // Apply horizontal movement (left-right)
      if (moveX > 0) {
        camera.panRight(moveX);
      } else if (moveX < 0) {
        camera.panLeft(-moveX);
      }
      
      // Apply vertical movement (up-down)
      if (moveY > 0) {
        camera.panDown(moveY);
      } else if (moveY < 0) {
        camera.panUp(-moveY);
      }
      
      // Update last position
      lastX = ev.clientX;
      lastY = ev.clientY;
      
      // Render the scene
      renderAllShapes();
    }
  };

  // Prevent contextmenu from appearing on right click
  canvas.oncontextmenu = function(ev) { 
    ev.preventDefault(); 
    return false;
  };
}

function initTextures() {

  // sky texture
  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create the image object');
    return false;
  }
  image0.onload = function() {
    console.log('Image loaded');
    sendImageToTEXTURE0(image0);
  };
  image0.src = 'sky.jpg';

  // road texture
  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  image1.onload = function() {
    console.log('Image loaded');
    sendImageToTEXTURE1(image1);
  };
  image1.src = 'street.png';

  // wall texture
  var image2 = new Image();
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  image2.onload = function() {
    console.log('Image loaded');
    sendImageToTEXTURE2(image2);
  };
  image2.src = 'wall.png';

  // tree texture
  var image3 = new Image();
  if (!image3) {
    console.log('Failed to create the image object');
    return false;
  }
  image3.onload = function() {
    console.log('Image loaded');
    sendImageToTEXTURE3(image3);
  };
  image3.src = 'tree.png';

  //leaf texture
  var image4 = new Image();
  if (!image4) {
    console.log('Failed to create the image object');
    return false;
  }
  image4.onload = function() {
    console.log('Image loaded');
    sendImageToTEXTURE4(image4);
  };
  image4.src = 'leaf.png';

  return true;
}

function sendImageToTEXTURE0(image) {
  
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Write the image data to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture unit 0 to u_Sampler
  gl.uniform1i(u_Sampler0, 0);

  // gl.clear(gl.COLOR_BUFFER_BIT);

  console.log('Texture loaded');
}

function sendImageToTEXTURE1(image) {

  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit 1
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Write the image data to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Pass the texture unit 1 to u_Sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log('Texture loaded');
}

function sendImageToTEXTURE2(image) {

  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit 2
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Write the image data to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture unit 2 to u_Sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log('Texture loaded');
}

function sendImageToTEXTURE3(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit 3
  gl.activeTexture(gl.TEXTURE3);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Write the image data to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture unit 3 to u_Sampler
  gl.uniform1i(u_Sampler3, 3);

  console.log('Texture loaded');
}

function sendImageToTEXTURE4(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit 4
  gl.activeTexture(gl.TEXTURE4);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Write the image data to the texture object
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Pass the texture unit 4 to u_Sampler
  gl.uniform1i(u_Sampler4, 4);

  console.log('Texture loaded');
}

function main() {
  camera = new Camera();
  setupWebGL();
  connectVariablesToGLSL();

  addActionsforHtmlUI();
  addKeyboardEvents();
  addMouseEvents();

  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.5,  0.5, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_strartTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_strartTime;
var g_chickenZ = 6;
var g_chickenY = 0;

function tick() {
  g_seconds = performance.now()/1000.0 - g_strartTime;

  if (anim){
    updateAnimationAngles();
  }
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  
  g_lightPos[0] = Math.cos(g_seconds);

}


function convertCoordinatesEvenToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y]);
}


function drawChicken(parentMatrix) {
  // If no parent matrix is provided, create an identity matrix
  if (!parentMatrix) {
    parentMatrix = new Matrix4();
  }

  // Body
  var body = new Cube();
  body.color = [0.90, 0.90, 0.90, 1.0];
  if (g_normalOn) {body.textureNum = -3;}
  body.matrix = new Matrix4(parentMatrix); // Use parent matrix
  body.matrix.translate(0.0, -0.4, 0.0);
  var bodyCoordinates = new Matrix4(body.matrix);
  body.matrix.scale(0.5, 0.6, 0.75);
  body.matrix.translate(-0.5, 0.0, 0.0);
  body.normalMatrix.setInverseOf(body.matrix).transpose();
  body.render();

  // Head
  var head = new Cube();
  head.color = [0.9, 0.9, 0.9, 1.0];
  if (g_normalOn) {head.textureNum = -3;}
  head.matrix = new Matrix4(bodyCoordinates); // Attach to body
  head.matrix.translate(-0.25, 0.6001, 0.2);
  head.matrix.rotate(g_headAngle, 1, 0, 0);
  head.matrix.translate(0.0, 0.0, -0.2);
  var headCoordinates = new Matrix4(head.matrix);
  head.matrix.scale(0.5, 0.5, 0.5);
  head.normalMatrix.setInverseOf(head.matrix).transpose();
  head.render();

  // Body Back
  var bodyBack = new Cube();
  bodyBack.color = [0.85, 0.85, 0.85, 1.0];
  if (g_normalOn) {bodyBack.textureNum = -3;}
  bodyBack.matrix = new Matrix4(bodyCoordinates); // Attach to body
  bodyBack.matrix.scale(0.4, 0.55, 0.2);
  bodyBack.matrix.translate(-0.5, 0.05, 3.75);
  bodyBack.normalMatrix.setInverseOf(bodyBack.matrix).transpose();
  bodyBack.render();

  // Right Eye
  var rightEye = new Cube();
  rightEye.color = [0.2, 0.2, 0.2, 1.0];
  if (g_normalOn) {rightEye.textureNum = -3;}
  rightEye.matrix = new Matrix4(headCoordinates); // Attach to head
  rightEye.matrix.translate(0.5, 0.25, 0.1);
  rightEye.matrix.scale(0.05, 0.1, 0.1);
  rightEye.normalMatrix.setInverseOf(rightEye.matrix).transpose();
  rightEye.render();

  // Left Eye
  var leftEye = new Cube();
  leftEye.color = [0.2, 0.2, 0.2, 1.0];
  if (g_normalOn) {leftEye.textureNum = -3;}
  leftEye.matrix = new Matrix4(headCoordinates); // Attach to head
  leftEye.matrix.translate(-0.05, 0.25, 0.1);
  leftEye.matrix.scale(0.05, 0.1, 0.1);
  leftEye.normalMatrix.setInverseOf(leftEye.matrix).transpose();
  leftEye.render();

  // Comb
  var comb = new Cube();
  comb.color = [1.0, 0.0, 0.0, 1.0];
  if (g_normalOn) {comb.textureNum = -3;}
  comb.matrix = new Matrix4(headCoordinates); // Attach to head
  comb.matrix.scale(0.1, 0.18, 0.3);
  comb.matrix.translate(2.0, 2.8, 0.25);
  comb.normalMatrix.setInverseOf(comb.matrix).transpose();
  comb.render();

  // Beak Top
  var beakTop = new Cube();
  beakTop.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {beakTop.textureNum = -3;}
  beakTop.matrix = new Matrix4(headCoordinates); // Attach to head
  beakTop.matrix.scale(0.08, 0.1, 0.12);
  beakTop.matrix.translate(2.5, 1.5, -1.0);
  beakTop.normalMatrix.setInverseOf(beakTop.matrix).transpose();
  beakTop.render();

  // Beak Bottom
  var beakBottom = new Cube();
  beakBottom.color = [0.9, 0.0, 0.0, 1.0];
  if (g_normalOn) {beakBottom.textureNum = -3;}
  beakBottom.matrix = new Matrix4(headCoordinates); // Attach to head
  beakBottom.matrix.scale(0.08, 0.08, 0.08);
  beakBottom.matrix.translate(2.5, 0.85, -1.0);
  beakBottom.normalMatrix.setInverseOf(beakBottom.matrix).transpose();
  beakBottom.render();

  // Right Arm
  var rightArm = new Cube();
  rightArm.color = [0.9, 0.9, 0.9, 1.0];
  if (g_normalOn) {rightArm.textureNum = -3;}
  rightArm.matrix = new Matrix4(bodyCoordinates); // Attach to body
  rightArm.matrix.translate(0.25, 0.5, 0.1);
  rightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
  rightArm.matrix.scale(0.2, 0.5, 0.5);
  rightArm.normalMatrix.setInverseOf(rightArm.matrix).transpose();
  rightArm.render();

  // Left Arm
  var leftArm = new Cube();
  leftArm.color = [0.9, 0.9, 0.9, 1.0];
  if (g_normalOn) {leftArm.textureNum = -3;}
  leftArm.matrix = new Matrix4(bodyCoordinates); // Attach to body
  // leftArm.matrix.rotate(180, 1, 0, 0);
  leftArm.matrix.translate(-0.1, 0.4, 0.1);
  leftArm.matrix.rotate(g_leftArmAngle, 0, 0, 1);
  leftArm.matrix.scale(0.2, 0.5, 0.5);
  leftArm.normalMatrix.setInverseOf(leftArm.matrix).transpose();
  leftArm.render();

  // Right Leg Top
  var rightLegTop = new Cube();
  rightLegTop.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {rightLegTop.textureNum = -3;}
  rightLegTop.matrix = new Matrix4(bodyCoordinates); // Attach to body
  rightLegTop.matrix.scale(0.05, 0.1, 0.05);
  rightLegTop.matrix.translate(1.0, -1.0, 5.0);
  rightLegTop.normalMatrix.setInverseOf(rightLegTop.matrix).transpose();
  var rightLegCoordinates = new Matrix4(rightLegTop.matrix);
  rightLegTop.render();

  // Right Leg Bottom
  var rightLegBottom = new Cube();
  rightLegBottom.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {rightLegBottom.textureNum = -3;}
  rightLegBottom.matrix = new Matrix4(rightLegCoordinates);
  rightLegBottom.matrix.scale(1.5, 0.4, 2.0);
  rightLegBottom.matrix.translate(-0.15, -1.0, -0.5);
  rightLegBottom.normalMatrix.setInverseOf(rightLegBottom.matrix).transpose();
  rightLegBottom.render();

  // Left Leg Top
  var leftLegTop = new Cube();
  leftLegTop.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {leftLegTop.textureNum = -3;}
  leftLegTop.matrix = new Matrix4(bodyCoordinates); // Attach to body
  leftLegTop.matrix.scale(0.05, 0.1, 0.05);
  leftLegTop.matrix.translate(-2.5, -1.0, 5.0);
  leftLegTop.normalMatrix.setInverseOf(leftLegTop.matrix).transpose();
  var leftLegCoordinates = new Matrix4(leftLegTop.matrix);
  leftLegTop.render();

  // Left Leg Bottom
  var leftLegBottom = new Cube();
  leftLegBottom.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {leftLegBottom.textureNum = -3;}
  leftLegBottom.matrix = new Matrix4(leftLegCoordinates);
  leftLegBottom.matrix.scale(1.5, 0.4, 2.0);
  leftLegBottom.matrix.translate(-0.15, -1.0, -0.5);
  leftLegBottom.normalMatrix.setInverseOf(leftLegBottom.matrix).transpose();
  leftLegBottom.render();
}

function normalizeSpotDirection(direction) {
  const length = Math.sqrt(
    direction[0] * direction[0] + 
    direction[1] * direction[1] + 
    direction[2] * direction[2]
  );
  
  if (length > 0) {
    return [
      direction[0] / length,
      direction[1] / length,
      direction[2] / length
    ];
  }
  
  return [0, -1, 0]; // Default down if zero length
}

function renderAllShapes(){

  // Get start time
  var startTime = performance.now();
  // console.log("View Matrix:", camera.viewMatrix.elements);
  // console.log("Projection Matrix:", camera.projectionMatrix.elements);

  // Set the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Floor
  var floor = new Cube();
  floor.color = [.76, .70, .50, 1];
  floor.textureNum = -2;
  floor.matrix.translate(-5.0, -0.75, -5.0);
  floor.matrix.scale(10.0, 0.00, 10.0);
  // floor.matrix.translate(-0.5, 0.0, -0.5);
  floor.render();

  // Sky
  var sky = new Cube();
  sky.color = [0.3, 0.0, 0.3, 1.0];
  if (g_normalOn) {sky.textureNum = -3;}
  sky.matrix.scale(-7,-7,-7);
  sky.matrix.rotate(180, 0, 0, 1);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.render();

  gl.uniform3f(u_lightColor, g_lightColor[0], g_lightColor[1], g_lightColor[2]);
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  gl.uniform3f(u_cameraPos, camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);
  gl.uniform1i(u_lightON, g_lightON);

  const normalizedSpotDir = normalizeSpotDirection(g_spotDirection);
  gl.uniform3f(u_spotDirection, normalizedSpotDir[0], normalizedSpotDir[1], normalizedSpotDir[2]);
  gl.uniform1f(u_spotCosineCutoff, g_spotCosineCutoff);
  gl.uniform1f(u_spotExponent, g_spotExponent);
  gl.uniform1i(u_spotlightON, g_spotlightON);

  // Light
  var light = new Cube();
  light.color = [2, 2, 0, 1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-0.1, -0.1, -0.1);
  light.matrix.translate(-0.5, -0.5, -0.5);
  light.render();

  // Sphere
  var sphere = new Sphere();
  sphere.color = [1.0, 0.0, 0.0, 1.0];
  sphere.matrix.translate(1, 0, 2);
  sphere.matrix.scale(0.5, 0.5, 0.5);
  if (g_normalOn) {sphere.textureNum = -3;}
  sphere.render();

  // Cube
  var cube = new Cube();
  cube.color = [0.0, 1.0, 0.0, 1.0];
  cube.matrix.translate(-2, -0.5, 2);
  if (g_normalOn) {cube.textureNum = -3;}
  cube.render();

  // Draw the chicken
  var chickenMatrix = new Matrix4();
  chickenMatrix.translate(0, g_chickenY-0.2, g_chickenZ-4);
  // chickenMatrix.rotate(0, 0, 1, 0);
  drawChicken(chickenMatrix);

  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

// Set text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log('Failed to retrieve the <' + htmlID + '> element');
    return;
  }
  htmlElm.innerHTML = text;
}
