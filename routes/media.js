const express = require("express");
const router = express.Router();
const isBase64 = require("is-base64");
const base64Img = require("base64-img");
const fs = require('fs');
const path = require('path');

const { Media } = require("../models");

// get all image
router.get('/', async (req, res) => {
  const media = await Media.findAll({
    attributes: ['id', 'image']
  });

  const mediaMapped = media.map((media) => {
    media.image = `${req.get('host')}/${media.image}`;

    return media;
  })

  return res.json({
    status: 'success',
    data: mediaMapped
  });
})

// find image by id
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  const media = await Media.findAll({
    where: {
      id: id,
    },
  })

  const mediaMapped = media.map((media) => {
    media.image = `${req.get('host')}/${media.image}`;

    return media;
  })

  return res.json({
    status: 'success',
    data: mediaMapped
  })
})

// delete media
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  const poto = await Media.findByPk(id);

  if(!poto) {
    return res.status(400).json({
      status: 'error',
      message: 'Media not found'
    })
  }

  let image = poto.image;
  
  const folder = path.join(__dirname, '../public', `${image}`);
  fs.unlink(folder, async (err) => {
    if(err) {
      return res.status(400).json({
        status: 'error',
        message: err.message
      })
    }

    await Media.destroy({
      where: {
        id: id
      }
    })

    return res.json({
      status: 'success',
      message: "Delete media success"
    })

  })
  
})

// post image
router.post("/", (req, res) => {
  const image = req.body.image;

  if (!isBase64(image, { mimeRequired: true })) {
    return res.status(400).json({
      status: "error",
      message: "invaid base64",
    });
  }

  base64Img.img(image, "./public/images", Date.now(), async (err, filepath) => {
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }

    const filename = filepath.split("\\").pop();

    const media = await Media.create({
      image: `images/${filename}`,
    });

    return res.json({
      status: "success",
      data: {
        id: media.id,
        image: `${req.get("host")}/images/${filename}`,
      },
    });
  });
});

module.exports = router;
