let Image = require('./controllers/imageController');

module.exports = app => {

    app.route('/').get((req, res) => {
        res.json({
            message: `This is the ${process.env.APP}`
        });
    });

    app.route('/images')
        .get(Image.getAll);

    app.route('/image/:id/tag/:tag')
        .put(Image.addTagToImage)
        .delete(Image.removeTagFromImage);

}