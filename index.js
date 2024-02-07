const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
mongoose
  .connect("mongodb://localhost:27017/coursesDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  subject: { type: String, required: true },
  chapters: { type: Number, required: true },
  noOfClasses: { type: Number, required: true },
  type: { type: String, enum: ["Personalised", "Group"], required: true },
  learnMode: {
    type: String,
    enum: ["assisted", "self-learning"],
    required: true,
  },
});
const Course = mongoose.model("Course", courseSchema);
app.post("/course/create", async (req, res) => {
  try {
    const { courseName, subject, chapters, noOfClasses, type, learnMode } =
      req.body;
    const newCourse = new Course({
      courseName,
      subject,
      chapters,
      noOfClasses,
      type,
      learnMode,
    });
    await newCourse.save();
    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.put("/course/update/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const { courseName, subject, chapters, noOfClasses, type, learnMode } =
      req.body;
    const courseToUpdate = await Course.findById(courseId);
    if (!courseToUpdate) {
      return res.status(404).json({ error: "Course not found" });
    }
    courseToUpdate.courseName = courseName || courseToUpdate.courseName;
    courseToUpdate.subject = subject || courseToUpdate.subject;
    courseToUpdate.chapters = chapters || courseToUpdate.chapters;
    courseToUpdate.noOfClasses = noOfClasses || courseToUpdate.noOfClasses;
    courseToUpdate.type = type || courseToUpdate.type;
    courseToUpdate.learnMode = learnMode || courseToUpdate.learnMode;
    await courseToUpdate.save();
    res.json({
      message: "Course updated successfully",
      course: courseToUpdate,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/course/get/:userType", async (req, res) => {
  try {
    const userType = req.params.userType.toLowerCase();
    if (userType === "student") {
      const courses = await Course.find(
        {},
        { _id: 0, courseName: 1, subject: 1 }
      );
      return res.json({ message: "Student view", courses });
    } else if (
      userType === "contentdeveloper" ||
      userType === "coursedeveloper"
    ) {
      const courses = await Course.find();
      return res.json({ message: "Course/Content Developer view", courses });
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
