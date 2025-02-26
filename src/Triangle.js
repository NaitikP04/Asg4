class Triangle {
    constructor (){
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;

        this.v1 = [0, 0];
        this.v2 = [1, 0];
        this.v3 = [0, 1];
    }

    setVertices(v1, v2, v3) {
        this.v1 = v1;
        this.v2 = v2;
        this.v3 = v3;
    }
  
    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size);

        // Draw
        var d = this.size / 200.0;
        drawTriangle([xy[0], xy[1], xy[0]+d, xy[1], xy[0], xy[1]+d]);
    }
}


function drawTriangle(vertices) {

    var n = 3; // The number of vertices
  
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_vertexBuffer = null; // Vertex buffer object
function initTriangle3D() {
  // Create a buffer object
  g_vertexBuffer = gl.createBuffer();
  if(!g_vertexBuffer){
    console.log('Failed to create the buffer object');
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);

  // Write date into the buffer object
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
}

function drawTriangle3D(vertices) {

  var n = vertices.length / 3; // The number of vertices
  if (!g_vertexBuffer) {
    initTriangle3D();
  }
  
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUV(vertices, uv) {
    var n = vertices.length; // The number of vertices
  
    // Create a buffer object for positions
    // ------------------------------------
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Create a buffer object for UV texture coordinates
    // -------------------------------------------------
    var uvBuffer = gl.createBuffer();
    if (!uvBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    // Write date into the buffer object    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_TexCoord variable
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
    
    // Enable the assignment to a_TexCoord variable
    gl.enableVertexAttribArray(a_UV);

    // Draw the triangle
    // -----------------
    gl.drawArrays(gl.TRIANGLES, 0, n/3);

    g_vertexBuffer = null;

}

function drawTriangle3DUVNormal(vertices, uv, normals) {
  var n = vertices.length; // The number of vertices

  // Create a buffer object for positions
  // ------------------------------------
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  // Create a buffer object for UV texture coordinates
  // -------------------------------------------------
  var uvBuffer = gl.createBuffer();
  if (!uvBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

  // Write date into the buffer object    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
  
  // Enable the assignment to a_TexCoord variable
  gl.enableVertexAttribArray(a_UV);

  // Create a buffer object for normals
  // -----------------------------------
  var normalBuffer = gl.createBuffer();
  if (!normalBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);

  // Assign the buffer object to a_Normal variable
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Normal variable
  gl.enableVertexAttribArray(a_Normal);

  // Draw the triangle
  // -----------------
  gl.drawArrays(gl.TRIANGLES, 0, n/3);

  g_vertexBuffer = null;

}

function drawLine3D(vertices) {
  var n = vertices.length / 3; // The number of vertices
  
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
  }
  
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  
  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  
  // Draw the line
  gl.drawArrays(gl.LINES, 0, n);
}