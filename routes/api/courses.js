const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const isAuthorized = require("../../middleware/isAuthorized");
const User = require("../../models/User");
const Course = require("../../models/Course");

// POST api/course
router.post(
  "/",
  [
    auth,
    isAuthorized,
    check("heading", "Please Make a Heading").not().isEmpty(),
    check("description", "Please Make a Description").not().isEmpty(),
    check("price", "Please Make a price").not().isEmpty(),
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newCourse = new Course({
        user: req.user.id,
        heading: req.body.heading,
        description: req.body.description,
        price: req.body.price,
      });

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "Invalid Request" });
      }

      await newCourse.save();

      user.courses.push(newCourse.id);
      await user.save();

      res.send(newCourse);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// GET api/courses
router.get("/", [auth], async (req, res) => {
  try {
    const Courses = await Course.find({ publish: true }).sort({ date: -1 });
    res.json(Courses);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// GET api/mycourses
router.get("/mycourses", [auth], async (req, res) => {
  try {
    console.log(req.user.id);
    const mycourses = await User.findOne({ _id: req.user.id }).populate([
      {
        path: "courses",
      },
    ]);
    console.log(mycourses);
    // const id = mycourses.courses;

    //  const Courses = await Course.findById(id).sort({ date: -1 });
    res.json(mycourses);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// GET api/Courses/:id
router.get("/course/:id", [auth], async (req, res) => {
  try {
    console.log("hiihi");
    console.log(req.params.id);
    const Courses = await Course.findById(req.params.id).populate("module");
    console.log(Courses);
    if (!Courses) {
      return res.status(404).json({ msg: "Course not found" });
    }
    if (!Courses.publish && req.user.type != "mentor") {
      return res.status(404).json({ msg: "Course not Yet Published" });
    }

    res.json(Courses);
  } catch (err) {
    console.log(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Course not found" });
    }
    res.status(500).send("Server Error");
  }
});

router.put("/edit/:id", [auth, isAuthorized], async (req, res) => {
  try {
    const { heading, text, price, publish } = req.body;

    const Courses = await Course.findById(req.params.id);

    if (Courses.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Not Authorized" });
    }

    if (!Courses) {
      return res.status(404).json({ msg: "Course not found" });
    }
    Courses.heading = heading;
    Courses.text = text;
    Courses.price = price;
    Courses.publish = publish;
    await Courses.save();

    res.json(Courses);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/rearrange/:id", [auth, isAuthorized], async (req, res) => {
  try {
    const order = req.body.order;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (course.user.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Not Authorized" });
    }

    course.modules = req.body.order;

    course.save();
    res.json(course);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
