module.exports = app => {

    app.route('/').get((req, res) => {
        res.json({
            message: `This is the ${process.env.APP}`
        });
    });
}