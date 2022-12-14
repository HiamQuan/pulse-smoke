const text = document.querySelector(".text");
text.innerHTML = text.textContent.replace(/\S/g, "<span>$&</span>");

let order = 1;

const span = document.querySelectorAll(".text span");

for (let i = 0; i < span.length; i++) {
    span[i].setAttribute("style", `--i:${order++ * 0.5};"`);
}

const bigHeart = document.querySelector(".big-heart");

let settings = {
    particles: {
        size: 10,
        effect: -1.3,
        length: 700,
        duration: 1,
        velocity: 200,
    },
};

let Point = (function () {
    function Point(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype.clone = function () {
        return new Point(this.x, this.y);
    };
    Point.prototype.length = function (length) {
        if (typeof length == "undefined") return Math.sqrt(this.x * this.x + this.y * this.y);
        this.normalize();
        this.x *= length;
        this.y *= length;
        return this;
    };
    Point.prototype.normalize = function () {
        let length = this.length();
        this.x /= length;
        this.y /= length;
        return this;
    };
    return Point;
})();

let HeartPiece = (function () {
    function HeartPiece() {
        this.position = new Point();
        this.velocity = new Point();
        this.acceleration = new Point();
        this.age = 0;
    }
    HeartPiece.prototype.initialize = function (x, y, dx, dy) {
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = dx;
        this.velocity.y = dy;
        this.acceleration.x = dx * settings.particles.effect;
        this.acceleration.y = dy * settings.particles.effect;
        this.age = 0;
    };
    HeartPiece.prototype.update = function (duration) {
        this.position.x += this.velocity.x * duration;
        this.position.y += this.velocity.y * duration;
        this.velocity.x += this.acceleration.x * duration;
        this.velocity.y += this.acceleration.y * duration;
        this.age += duration;
    };
    HeartPiece.prototype.draw = function (context, image) {
        function ease(t) {
            return --t * t * t + 1;
        }
        let size = image.width * ease(this.age / settings.particles.duration);
        context.globalAlpha = 1 - this.age / settings.particles.duration;
        context.drawImage(image, this.position.x - size / 2, this.position.y - size / 2, size, size);
    };
    return HeartPiece;
})();

let Pool = (function () {
    let particles,
        firstActive = 0,
        firstFree = 0,
        duration = settings.particles.duration;

    function Pool(length) {
        particles = new Array(length);
        for (let i = 0; i < particles.length; i++) particles[i] = new HeartPiece();
    }
    Pool.prototype.add = function (x, y, dx, dy) {
        particles[firstFree].initialize(x, y, dx, dy);

        firstFree++;
        if (firstFree == particles.length) firstFree = 0;
        if (firstActive == firstFree) firstActive++;
        if (firstActive == particles.length) firstActive = 0;
    };
    Pool.prototype.update = function (deltaTime) {
        let i;

        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++) particles[i].update(deltaTime);
            for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
        }

        while (particles[firstActive].age >= duration && firstActive != firstFree) {
            firstActive++;
            if (firstActive == particles.length) firstActive = 0;
        }
    };
    Pool.prototype.draw = function (context, image) {
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++) particles[i].draw(context, image);
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++) particles[i].draw(context, image);
            for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
        }
    };
    return Pool;
})();

(function (canvas) {
    let context = canvas.getContext("2d"),
        particles = new Pool(settings.particles.length),
        particleRate = settings.particles.length / settings.particles.duration,
        time;

    function moveInnerHeart(t) {
        return new Point(
            160 * Math.pow(Math.sin(t), 3),
            130 * Math.cos(t) - 50 * Math.cos(2 * t) - 20 * Math.cos(3 * t) - 10 * Math.cos(4 * t) + 25
        );
    }

    let image = (function () {
        let canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");
        canvas.width = settings.particles.size;
        canvas.height = settings.particles.size;
        function to(t) {
            let point = moveInnerHeart(t);
            point.x = settings.particles.size / 2 + (point.x * settings.particles.size) / 350;
            point.y = settings.particles.size / 2 - (point.y * settings.particles.size) / 350;
            return point;
        }
        context.beginPath();
        let t = -Math.PI;
        let point = to(t);
        context.moveTo(point.x, point.y);
        while (t < Math.PI) {
            t += 0.01;
            point = to(t);
            context.lineTo(point.x, point.y);
        }
        context.closePath();
        context.fillStyle = "whitesmoke";
        context.fill();
        // create the image
        let image = new Image();
        image.src = canvas.toDataURL();
        return image;
    })();

    function render() {
        requestAnimationFrame(render);

        let newTime = new Date().getTime() / 1000,
            deltaTime = newTime - (time || newTime);
        time = newTime;

        context.clearRect(0, 0, canvas.width, canvas.height);

        let amount = particleRate * deltaTime;
        for (let i = 0; i < amount; i++) {
            let pos = moveInnerHeart(Math.PI - 2 * Math.PI * Math.random());
            let dir = pos.clone().length(settings.particles.velocity);
            particles.add(canvas.width / 2 + pos.x, canvas.height / 2 - pos.y, dir.x, -dir.y);
        }

        particles.update(deltaTime);
        particles.draw(context, image);
    }

    function onResize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    window.onresize = onResize;

    setTimeout(function () {
        onResize();
        render();
    }, 10);
})(document.getElementById("heartBox"));
