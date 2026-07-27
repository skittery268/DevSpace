// Modules
const express = require("express");

// Controllers
const { getUserProjects, getProject, createProject, deleteProject, updateProject } = require("../controllers/project.controller");

// Middlewares
const { protect } = require("../middlewares/auth.middleware");

// -------------------------------------IMPORTS-------------------------------------

const projectRouter = express.Router();

// Route to get only user projects
projectRouter.get("/", getUserProjects);
// Route to get one user project
projectRouter.get("/:id", getProject);
// Route to create new project
projectRouter.post("/", protect, createProject);
// Route to delete project
projectRouter.delete("/:id", protect, deleteProject);
// Route to update project information
projectRouter.patch("/:id", protect, updateProject);

module.exports = projectRouter;