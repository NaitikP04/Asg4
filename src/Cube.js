class Cube{
    // construct new triangle object 
    constructor(){
        this.type       = 'cube';
        this.color      = [1.0,1.0,1.0,1.0];
        this.matrix     = new Matrix4();
        this.textureNum = -2;
        this.verts = [
            // Front of cube
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,

            // Top of cube
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,

            // Bottom of cube
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,

            // Left side of cube
            1,0,0, 1,1,1, 1,1,0,
            1,0,0, 1,0,1, 1,1,1,

            // Right side of cube
            0,0,0, 0,1,1, 0,1,0,
            0,0,0, 0,0,1, 0,1,1,
            
            // Back of cube 
            0,0,1, 1,1,1, 0,1,1,
            0,0,1, 1,0,1, 1,1,1
        ];
        this.vert32bit = new Float32Array([
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,
    
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,
    
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,
    
            0,0,0, 1,0,1, 0,0,1,
            0,0,0, 1,0,0, 1,0,1,
    
            1,0,0, 1,1,1, 1,1,0,
            1,0,0, 1,0,1, 1,1,1,
    
            0,0,1, 1,1,1, 0,1,1,
            0,0,1, 1,0,1, 1,1,1
        ]);
        this.uvVerts  = [
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1,
            0,0, 1,1, 1,0,  0,0, 0,1, 1,1
        ];
        this.normals = [
            // Front face normals
            0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, 1, 0, 0, 1, 0, 0, 1,

            // Top face normals
            0, 1, 0, 0, 1, 0, 0, 1, 0,
            0, 1, 0, 0, 1, 0, 0, 1, 0,

            // Bottom face normals
            0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0,

            // Left face normals
            1, 0, 0, 1, 0, 0, 1, 0, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0,

            // Right face normals
            -1, 0, 0, -1, 0, 0, -1, 0, 0,
            -1, 0, 0, -1, 0, 0, -1, 0, 0,

            // Back face normals
            0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, 0, -1, 0, 0, -1, 0, 0, -1
        ];
    }

    // render(){
    //     var rgba = this.color;                                           
        
    //     // Pass the texture number
    //     gl.uniform1i(u_whichTexture, this.textureNum);
    //     // Pass the color of point to u_FragColor
    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  
    //     // Pass the matrix to u_ModelMatrix attribute 
    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
    //     // Front of cube
    //     drawTriangle3DUV([0,0,0,  1,1,0,  1,0,0], [0,0, 1,1, 1,0]);
    //     drawTriangle3DUV([0,0,0,  0,1,0,  1,1,0], [0,0, 0,1, 1,1]);

    //     // Top of cube
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    //     drawTriangle3DUV([0,1,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
    //     drawTriangle3DUV([0,1,0,  0,1,1,  1,1,1], [0,0, 0,1, 1,1]);

    //     // Bottom of cube
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    //     drawTriangle3DUV([0,0,0,  1,0,1,  0,0,1], [0,0, 1,1, 1,0]);
    //     drawTriangle3DUV([0,0,0,  1,0,0,  1,0,1], [0,0, 0,1, 1,1]);

    //     // Left side of cube
    //     gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    //     drawTriangle3DUV([1,0,0,  1,1,1,  1,1,0], [0,0, 1,1, 1,0]);
    //     drawTriangle3DUV([1,0,0,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);

    //     // Right side of cube
    //     gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
    //     drawTriangle3DUV([0,0,0,  0,1,1,  0,1,0], [0,0, 1,1, 1,0]);
    //     drawTriangle3DUV([0,0,0,  0,0,1,  0,1,1], [0,0, 0,1, 1,1]);

    //     // Back of cube
    //     gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);
    //     drawTriangle3DUV([0,0,1,  1,1,1,  0,1,1], [0,0, 1,1, 1,0]);
    //     drawTriangle3DUV([0,0,1,  1,0,1,  1,1,1], [0,0, 0,1, 1,1]);
    // }

    
    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of point to u_FragColor
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Draw each face with appropriate normals
        for (let i = 0; i < this.verts.length; i += 9) {
            const vertices = this.verts.slice(i, i + 9);
            const normals = this.normals.slice(i, i + 9);
            drawTriangle3DUVNormal(vertices, this.uvVerts.slice(i / 3 * 2, (i / 3 + 3) * 2), normals);
        }
    }


    renderfast(){
        var rgba = this.color;
        gl.uniform1i(u_whichTexture, this.textureNum);
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var allverts = [];

        // Front of cube
        allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);

        // Top of cube
        allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
        allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);

        // Bottom of cube
        allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
        allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);

        // Right of cube
        allverts = allverts.concat([0,0,0, 1,0,1, 0,0,1]);
        allverts = allverts.concat([0,0,0, 1,0,0, 1,0,1]);

        // Left of cube
        allverts = allverts.concat([1,0,0, 1,1,1, 1,1,0]);
        allverts = allverts.concat([1,0,0, 1,0,1, 1,1,1]);

        // Back of cube
        allverts = allverts.concat([0,0,1, 1,1,1, 0,1,1]);
        allverts = allverts.concat([0,0,1, 1,0,1, 1,1,1]);

        drawTriangle3D(allverts);
    }

    renderfaster(){
        var rgba = this.color;                                           
        
        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of point to u_FragColor
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);  

        // Pass the matrix to u_ModelMatrix attribute 
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        drawTriangle3DUVNormal(this.verts, this.uvVerts, this.normals);
    }

    renderWireframe() {
        var rgba = this.color;
        
        // Pass the texture number 
        gl.uniform1i(u_whichTexture, -2);
        
        // Pass the color
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass the matrix
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        const edges = [
            // Front face
            0,0,0, 1,0,0,
            1,0,0, 1,1,0,
            1,1,0, 0,1,0,
            0,1,0, 0,0,0,
            
            // Back face
            0,0,1, 1,0,1,
            1,0,1, 1,1,1,
            1,1,1, 0,1,1,
            0,1,1, 0,0,1,
            
            // Connecting edges
            0,0,0, 0,0,1,
            1,0,0, 1,0,1,
            1,1,0, 1,1,1,
            0,1,0, 0,1,1
        ];
        
        const originalMode = gl.getParameter(gl.LINE_WIDTH);
        
        gl.lineWidth(1);
        
        for (let i = 0; i < edges.length; i += 6) {
            const lineVerts = edges.slice(i, i + 6);
            drawLine3D(lineVerts);
        }
        
        gl.lineWidth(originalMode);
    }
}