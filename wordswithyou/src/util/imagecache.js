ImageCache = {
    images: {},

    get: function(path) {
        if (!(path in this.images)) {
            var image = new Image();
            image.src = path;
            this.images[path] = image;
        }

        return this.images[path];
    }
};