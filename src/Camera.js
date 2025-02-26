class Camera {
    constructor() {
        // this.fov = 60; // Field of view
        this.eye = new Vector3([0, 0, 0]); // Camera position
        this.at = new Vector3([0, 0, 1]); // Look-at point
        this.up = new Vector3([0, 1, 0]); // Up vector
        this.viewMatrix = new Matrix4(); // View matrix
        this.projectionMatrix = new Matrix4(); // Projection matrix

        this.updateViewMatrix();
        this.updateProjectionMatrix();
    }

    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    updateProjectionMatrix(fov = 60) {
        let canvas = document.getElementById('webgl');
        this.projectionMatrix.setPerspective(
            fov, canvas.width / canvas.height, 1, 1000
        );
    }

    moveForward(speed = 0.1) {
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);
        var f = a.sub(e);
        f.normalize();
        f.mul(speed);

        this.eye.add(f);
        this.at.add(f);
        this.updateViewMatrix();
    }

    moveBackwards(speed = 0.1) {
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);        
        var b = a.sub(e);
        b.normalize();
        b.mul(speed);
        this.eye.sub(b);
        this.at.sub(b);
        this.updateViewMatrix();
    }

    moveLeft(speed = 0.1) {
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);
        var l = a.sub(e);
        l.normalize();
        l.mul(-1);

        var s = Vector3.cross(l, this.up);
        s.normalize();
        s.mul(speed);

        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    moveRight(speed = 0.1) {
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);
        var l = a.sub(e);
        l.normalize();
        l.mul(-1);

        var s = Vector3.cross(this.up, l);
        s.normalize();
        s.mul(speed);

        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    panLeft(alpha = 5) { 
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);
        var f = a.sub(e);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at = f_prime.add(this.eye);
        this.updateViewMatrix();
    }

    panRight(alpha = 5) { 
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);
        var f = a.sub(e);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at = f_prime.add(this.eye);
        this.updateViewMatrix();
    }

    panUp(alpha = 5) {
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);
        var f = a.sub(e);

        // Calculate the horizontal axis (right vector)
        var right = Vector3.cross(this.up, f);
        right.normalize();

        // Create a rotation matrix around the right axis
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, right.elements[0], right.elements[1], right.elements[2]);

        // Rotate the forward vector
        let f_prime = rotationMatrix.multiplyVector3(f);

        // Update the look-at point
        this.at = f_prime.add(this.eye);
        this.updateViewMatrix();
    }

    panDown(alpha = 5) {
        var a = new Vector3(this.at.elements);
        var e = new Vector3(this.eye.elements);
        var f = a.sub(e);

        // Calculate the horizontal axis (right vector)
        var right = Vector3.cross(this.up, f);
        right.normalize();

        // Create a rotation matrix around the right axis
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, right.elements[0], right.elements[1], right.elements[2]);

        // Rotate the forward vector
        let f_prime = rotationMatrix.multiplyVector3(f);

        // Update the look-at point
        this.at = f_prime.add(this.eye);
        this.updateViewMatrix();
    }

    goUp() {
        this.eye.elements[1] += 0.1;
        this.at.elements[1] += 0.1;
        this.updateViewMatrix();
    }

    goDown() {
        this.eye.elements[1] -= 0.1;
        this.at.elements[1] -= 0.1;
        this.updateViewMatrix();
    }
}