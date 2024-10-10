module.exports = async function (err, req, res, next) {
    console.log("> Error: ", err);

    res.status(500).send({data: [], error: 'Unable to authenticate user.', total: 0});
}