const router = require("express").Router();
const Task = require("../models/task");
const User = require("../models/user");
const { authenticateToken } = require("./auth");

//create-task
router.post("/create-task", authenticateToken, async (req, res) => {
  try {
    const { title, desc, startDate, endDate } = req.body; // Destructure startDate and endDate
    const { id } = req.headers;

    // Validate that startDate and endDate are provided and are valid dates
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "Start date cannot be after end date" });
    }

    const newTask = new Task({
      title,
      desc,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    const saveTask = await newTask.save();
    const taskId = saveTask._id;

    // Add the task ID to the user's tasks array
    await User.findByIdAndUpdate(id, { $push: { tasks: taskId } });

    res.status(200).json({ message: "Task Created", task: saveTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//get All Tasks
const moment = require("moment");

router.get("/get-all-tasks", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const userData = await User.findById(id).populate({
      path: "tasks",
      options: { sort: { createdAt: -1 } },
    });

    // Format startDate and endDate for each task
    const formattedTasks = userData.tasks.map((task) => ({
      ...task.toObject(), // Convert the task document to a plain object
      startDate: task.startDate
        ? moment(task.startDate).format("DD-MM-YY")
        : null,
      endDate: task.endDate ? moment(task.endDate).format("DD-MM-YY") : null,
    }));

    res
      .status(200)
      .json({ data: { ...userData.toObject(), tasks: formattedTasks } });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

//delete Task
router.delete("/delete-task/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.id;
    await Task.findByIdAndDelete(id);
    await User.findByIdAndUpdate(userId, { $pull: { tasks: id } });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

//update Task
router.put("/update-task/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, desc } = req.body;
    await Task.findByIdAndUpdate(id, { title: title, desc: desc });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

//update-Important Task
router.put("/update-imp-task/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const TaskData = await Task.findById(id);
    const ImpTask = TaskData.important;
    await Task.findByIdAndUpdate(id, { important: !ImpTask });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

//update-Complete Task
router.put("/update-complete-task/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const TaskData = await Task.findById(id);
    const CompleteTask = TaskData.complete;
    await Task.findByIdAndUpdate(id, { complete: !CompleteTask });
    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

//get important tasks
router.get("/get-imp-tasks", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const Data = await User.findById(id).populate({
      path: "tasks",
      match: { important: true },
      options: { sort: { createdAt: -1 } },
    });
    const ImpTaskData = Data.tasks;
    res.status(200).json({ data: ImpTaskData });
  } catch (error) {
    //console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

//get completed tasks
router.get("/get-complete-tasks", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const Data = await User.findById(id).populate({
      path: "tasks",
      match: { complete: true },
      options: { sort: { createdAt: -1 } },
    });
    const CompTaskData = Data.tasks;
    res.status(200).json({ data: CompTaskData });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});

//get incompleted tasks
router.get("/get-incomplete-tasks", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers;
    const Data = await User.findById(id).populate({
      path: "tasks",
      match: { complete: false },
      options: { sort: { createdAt: -1 } },
    });
    const CompTaskData = Data.tasks;
    res.status(200).json({ data: CompTaskData });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Internal Server Error" });
  }
});
module.exports = router;
