// Models
const Project = require("../models/project.model");

// Utils
const AppError = require("../utils/appError.util");
const catchAsync = require("../utils/catchAsync.util");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get only user projects
// GET /api/v1/projects
const getUserProjects = catchAsync(async (req, res, next) => {
    const projects = await Project.find({ ownerId: req.user._id }).populate("ownerId");

    res.status(200).json({
        status: "success",
        message: "Projects returned successfully!",
        data: {
            projects
        }
    });
});

// Controller to get only one user project
// GET /api/v1/projects/:id
const getProject = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const project = await Project.findById(id).populate("ownerId");

    if (!project) {
        return next(new AppError("Project not found!", 404));
    };

    res.status(200).json({
        status: "success",
        message: "Project returned successfully!",
        data: {
            project
        }
    });
});

// Controller to create new project
// POST /api/v1/projects
const createProject = catchAsync(async (req, res, next) => {
    const { name, description } = req.body;

    const project = await Project.create({ name, description, ownerId: req.user._id });

    res.status(201).json({
        status: "success",
        message: "Project created successfully!",
        data: {
            project
        }
    });
});

// Controller to delete project
// DELETE /api/v1/projects/:id
const deleteProject = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        return next(new AppError("Project not found!", 404));
    };

    if (project.ownerId.toString() !== req.user._id.toString()) {
        return next(new AppError("You cant delete this project!", 401));
    };

    await Project.findByIdAndDelete(id);

    res.status(200).json({
        status: "success",
        message: "Project deleted successfully!"
    });
});

// Controller to update project information
// PATCH /api/v1/projects/:id
const updateProject = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;

    const project = await Project.findById(id);

    if (!project) {
        return next(new AppError("Project not found!", 404));
    };

    if (project.ownerId.toString() !== req.user._id.toString()) {
        return next(new AppErrro("You cant edit this project!", 401));
    };

    if (name) project.name = name;
    if (description) project.description = description;
    if (isPublic === true || isPublic === false) project.isPublic = isPublic;

    await project.save();

    res.status(200).json({
        status: "success",
        message: "Project edited successfully!",
        data: {
            project
        }
    });
});

module.exports = { getUserProjects, getProject, createProject, deleteProject, updateProject };
