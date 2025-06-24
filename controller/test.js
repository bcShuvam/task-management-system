const test = (req, res) => {
    try {
        return res.status(200).json({message: 'Test was successful'});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

const test2 = (req, res) => {
    try {
        return res.status(200).json({message: 'Test 2 was success'});
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
}

module.exports = {test, test2};