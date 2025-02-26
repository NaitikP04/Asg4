// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV; 
    v_Normal = a_Normal;
  }`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_whichTexture;
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
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;
let g_selectedBlockType = 1;

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

// Actions for HTML UI
function addActionsforHtmlUI(){

  var audio = new Audio('chickenSfx.mp3');
  audio.loop = true;

  // Animation Button Events
  document.getElementById('animationOn').onclick = function() {
    anim = true;
    audio.play();
  };
  document.getElementById('animationOff').onclick = function() {
    anim = false; 
    g_chickenY = 0; 
    renderAllShapes(); 
    audio.pause();
    audio.currentTime = 0;
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
    g_chickenZ += 0.03;
    g_chickenY = 0.75 + 0.5 * (Math.sin(g_seconds));
  }
  renderAllShapes();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  
  // Animation for the head angle (-10 to 20 degrees)
  g_headAngle = -10 + 15 * Math.sin(g_seconds * 2); // Oscillates between -10 and 20

  // Animation for the right arm angle (220 to 245 degrees)
  g_rightArmAngle = 220 + 12.5 * Math.sin(g_seconds * 3); // Oscillates between 220 and 245

  // Animation for the left arm angle (110 to 130 degrees)
  g_leftArmAngle = 110 + 10 * Math.sin(g_seconds * 3); // Oscillates between 110 and 130

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
  head.render();

  // Body Back
  var bodyBack = new Cube();
  bodyBack.color = [0.85, 0.85, 0.85, 1.0];
  if (g_normalOn) {bodyBack.textureNum = -3;}
  bodyBack.matrix = new Matrix4(bodyCoordinates); // Attach to body
  bodyBack.matrix.scale(0.4, 0.55, 0.2);
  bodyBack.matrix.translate(-0.5, 0.05, 3.75);
  bodyBack.render();

  // Right Eye
  var rightEye = new Cube();
  rightEye.color = [0.2, 0.2, 0.2, 1.0];
  if (g_normalOn) {rightEye.textureNum = -3;}
  rightEye.matrix = new Matrix4(headCoordinates); // Attach to head
  rightEye.matrix.translate(0.5, 0.25, 0.1);
  rightEye.matrix.scale(0.05, 0.1, 0.1);
  rightEye.render();

  // Left Eye
  var leftEye = new Cube();
  leftEye.color = [0.2, 0.2, 0.2, 1.0];
  if (g_normalOn) {leftEye.textureNum = -3;}
  leftEye.matrix = new Matrix4(headCoordinates); // Attach to head
  leftEye.matrix.translate(-0.05, 0.25, 0.1);
  leftEye.matrix.scale(0.05, 0.1, 0.1);
  leftEye.render();

  // Comb
  var comb = new Cube();
  comb.color = [1.0, 0.0, 0.0, 1.0];
  if (g_normalOn) {comb.textureNum = -3;}
  comb.matrix = new Matrix4(headCoordinates); // Attach to head
  comb.matrix.scale(0.1, 0.18, 0.3);
  comb.matrix.translate(2.0, 2.8, 0.25);
  comb.render();

  // Beak Top
  var beakTop = new Cube();
  beakTop.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {beakTop.textureNum = -3;}
  beakTop.matrix = new Matrix4(headCoordinates); // Attach to head
  beakTop.matrix.scale(0.08, 0.1, 0.12);
  beakTop.matrix.translate(2.5, 1.5, -1.0);
  beakTop.render();

  // Beak Bottom
  var beakBottom = new Cube();
  beakBottom.color = [0.9, 0.0, 0.0, 1.0];
  if (g_normalOn) {beakBottom.textureNum = -3;}
  beakBottom.matrix = new Matrix4(headCoordinates); // Attach to head
  beakBottom.matrix.scale(0.08, 0.08, 0.08);
  beakBottom.matrix.translate(2.5, 0.85, -1.0);
  beakBottom.render();

  // Right Arm
  var rightArm = new Cube();
  rightArm.color = [0.9, 0.9, 0.9, 1.0];
  if (g_normalOn) {rightArm.textureNum = -3;}
  rightArm.matrix = new Matrix4(bodyCoordinates); // Attach to body
  rightArm.matrix.translate(0.25, 0.5, 0.1);
  rightArm.matrix.rotate(g_rightArmAngle, 0, 0, 1);
  rightArm.matrix.scale(0.2, 0.5, 0.5);
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
  leftArm.render();

  // Right Leg Top
  var rightLegTop = new Cube();
  rightLegTop.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {rightLegTop.textureNum = -3;}
  rightLegTop.matrix = new Matrix4(bodyCoordinates); // Attach to body
  rightLegTop.matrix.scale(0.05, 0.1, 0.05);
  rightLegTop.matrix.translate(1.0, -1.0, 5.0);
  var rightLegCoordinates = new Matrix4(rightLegTop.matrix);
  rightLegTop.render();

  // Right Leg Bottom
  var rightLegBottom = new Cube();
  rightLegBottom.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {rightLegBottom.textureNum = -3;}
  rightLegBottom.matrix = new Matrix4(rightLegCoordinates);
  rightLegBottom.matrix.scale(1.5, 0.4, 2.0);
  rightLegBottom.matrix.translate(-0.15, -1.0, -0.5);
  rightLegBottom.render();

  // Left Leg Top
  var leftLegTop = new Cube();
  leftLegTop.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {leftLegTop.textureNum = -3;}
  leftLegTop.matrix = new Matrix4(bodyCoordinates); // Attach to body
  leftLegTop.matrix.scale(0.05, 0.1, 0.05);
  leftLegTop.matrix.translate(-2.5, -1.0, 5.0);
  var leftLegCoordinates = new Matrix4(leftLegTop.matrix);
  leftLegTop.render();

  // Left Leg Bottom
  var leftLegBottom = new Cube();
  leftLegBottom.color = [1.0, 0.64, 0.0, 1.0];
  if (g_normalOn) {leftLegBottom.textureNum = -3;}
  leftLegBottom.matrix = new Matrix4(leftLegCoordinates);
  leftLegBottom.matrix.scale(1.5, 0.4, 2.0);
  leftLegBottom.matrix.translate(-0.15, -1.0, -0.5);
  leftLegBottom.render();
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
  floor.matrix.translate(0.0, -0.75, 0.0);
  floor.matrix.scale(10.0, 0.00, 10.0);
  floor.matrix.translate(-0.5, 0.0, -0.5);
  floor.renderfast();

  // Sky
  var sky = new Cube();
  //maroon color dark red
  sky.color = [0.3, 0.0, 0.3, 1.0];
  if (g_normalOn) {sky.textureNum = -3;}
  // sky.matrix.translate(0,0,2);
  sky.matrix.scale(-7,-7,-7);
  sky.matrix.rotate(180, 0, 0, 1);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.render();

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
