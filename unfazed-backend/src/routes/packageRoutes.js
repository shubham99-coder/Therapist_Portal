const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/packageController');

router.get('/mine', auth, c.listMine);
router.post('/', auth, c.create);
router.put('/:id', auth, c.update);
router.delete('/:id', auth, c.remove);

router.get('/public/:slug', c.listPublic);

module.exports = router;
