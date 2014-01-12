ImageCache = function() {
    var RETRY_DELAY = 3000;

    this.images = {};

    this.get = function(path, retry) {
        if (!(path in this.images)) {
            var image = new Image();
            image.src = path;
            this.images[path] = image;
        }

        return this.images[path];
    };

    this.clear = function() {
        /*$(this.images).each(function(image) {
            image.parentNode.removeChild(image);
        });*/
        this.images = {};
    };

    return this;
};