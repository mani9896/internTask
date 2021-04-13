const express = require("express");
const router = express.Router();
var cloudinary = require("cloudinary");
const config = require("config");

const auth = require("../../middleware/auth");
const isAuthorized = require("../../middleware/isAuthorized");
const Course = require("../../models/Course");
const Module = require("../../models/Module");
const upload = require("../../middleware/multerMiddleware");

cloudinary.config({
  cloud_name: config.get("cloud_name"),
  api_key: config.get("API_Key"),
  api_secret: config.get("API_secret"),
});

router.put("/create/:id", [auth, isAuthorized], async (req, res) => {
  try {
    const newModule = new Module({
      course: req.params.id,
    });

    await newModule.save();

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }

    if (course.user.toString() != req.user.id) {
      return res.status(400).json({ msg: "User not authorized" });
    }

    course.modules.push(newModule);
    course.save();

    res.status(200).json({ msg: "Module Created Succesfully" });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/edit/:id", [auth, isAuthorized], async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ msg: "Module not found" });
    }
    const course = await Course.findById(module.course.toString());
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    if (course.user.toString() != req.user.id) {
      return res.status(400).json({ msg: "User not authorized" });
    }

    res.json(module);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.put(
  "/uploadvideo/:id",
  [auth, isAuthorized, upload.array("video")],
  async (req, res) => {
    try {
      const module = await Module.findById(req.params.id);
      if (!module) {
        return res.status(404).json({ msg: "Module not found" });
      }
      const course = await Course.findById(module.course.toString());
      if (!course) {
        return res.status(404).json({ msg: "course not found" });
      }
      if (course.user.toString() != req.user.id) {
        return res.status(400).json({ msg: "User not authorized" });
      }

      await cloudinary.v2.uploader.upload(
        req.files[0].path,
        {
          resource_type: "video",
          chunk_size: 6000000,
          eager: [
            { width: 300, height: 300, crop: "pad", audio_codec: "none" },
            {
              width: 160,
              height: 100,
              crop: "crop",
              gravity: "south",
              audio_codec: "none",
            },
          ],
          eager_async: true,
          eager_notification_url: "https://mysite.example.com/notify_endpoint",
        },
        async (error, result) => {
          const filter = req.params.id;
          const update = { video: result.url };
          const updatedModule = await Module.findByIdAndUpdate(filter, update, {
            new: true,
          });

          res.send(updatedModule);
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

router.put(
  "/imageupload/:id",
  [auth, isAuthorized, upload.array("image")],
  async (req, res) => {
    try {
      const module = await Module.findById(req.params.id);
      if (!module) {
        return res.status(404).json({ msg: "Module not found" });
      }
      const course = await Course.findById(module.course.toString());
      if (!course) {
        return res.status(404).json({ msg: "course not found" });
      }
      if (course.user.toString() != req.user.id) {
        return res.status(400).json({ msg: "User not authorized" });
      }
      await cloudinary.uploader.upload(
        req.files[0].path,
        async (result, error) => {
          {
            const filter = req.params.id;
            const update = { image: result.url };
            const updatedModule = await Module.findByIdAndUpdate(
              filter,
              update,
              {
                new: true,
              }
            );

            res.send(updatedModule);
          }
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  }
);

router.put("/addtext/:id", [auth, isAuthorized], async (req, res) => {
  try {
    const filter = req.params.id;
    const update = { text: req.body.text };
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ msg: "Module not found" });
    }
    const course = await Course.findById(module.course.toString());
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }
    if (course.user.toString() != req.user.id) {
      return res.status(400).json({ msg: "User not authorized" });
    }
    const updatedModule = await Module.findByIdAndUpdate(filter, update, {
      new: true,
    });
    res.send(updatedModule);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.put("/addassignment/:id", [auth, isAuthorized], async (req, res) => {
  try {
    const filter = req.params.id;
    const update = { assignment: req.body.assignment };

    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ msg: "Module not found" });
    }

    const course = await Course.findById(module.course.toString());
    if (!course) {
      return res.status(404).json({ msg: "course not found" });
    }

    if (course.user.toString() != req.user.id) {
      return res.status(400).json({ msg: "User not authorized" });
    }

    const updatedModule = await Module.findByIdAndUpdate(filter, update, {
      new: true,
    });
    res.send(updatedModule);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.delete("/delete/:id", [auth, isAuthorized], async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ msg: "Module not found" });
    }
    const courseId = module.course;
    const course = await Course.findById(courseId.toString());
    if (!course) {
      return res.status(404).json({ msg: "Course not found " });
    }

    if (course.user.toString() != req.user.id) {
      return res.status(400).json({ msg: "User not authorized" });
    }

    const index = course.modules.indexOf({ _id: req.params.id });
    if (index != -1) {
      course.modules.splice(index, 1);
    }
    await Module.findByIdAndDelete(req.params.id);

    course.save();
    res.json(course);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
