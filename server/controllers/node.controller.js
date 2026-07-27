// Models
const Node = require("../models/node.model");

// Utils
const catchAsync = require("../utils/catchAsync.util");
const AppError = require("../utils/appError.util");

// Services
const fileStorage = require("../services/fileStorage.service");

// -------------------------------------IMPORTS-------------------------------------

// Controller to get file tree
// GET /api/v1/nodes/:projectId
const getFileTree = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;

    const nodes = await Node.find({ projectId });

    const map = new Map();

    for (const node of map.values()) {
        map.set(node._id.toString(), {
            ...node,
            children: []
        });
    };

    const tree = [];

    for (const node of nodes) {
        if (!node.parentId) {
            tree.push(node);
            continue;
        };

        const parent = map.get(node.parentId.toString());

        parent.children.push(node);
    };

    res.status(200).json({
        status: "success",
        message: "Files returned successfully!",
        data: {
            files: tree
        }
    });
});

// Controller to get file content
// GET /api/v1/nodes/content/:id
const getFileContent = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const fileContent = await fileStorage.getContent(id);

    res.status(200).json({
        status: "success",
        message: "File content returned successfully!",
        data: {
            fileContent
        }
    });
});

// Controller to create new file / folder
// POST /api/v1/nodes/:projectId
const createNode = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const { name, type, parentId, content } = req.body;

    if (type === "file") {
        const exists = await Node.findOne({ name });

        if (exists && exists.parentId.toString() === parentId.toString()) {
            return next(new AppError("File with this name in this folder already exists!", 409));
        };
    };

    const node = await Node.create({ projectId, name, type, parentId, content });

    res.status(201).json({
        status: "success",
        message: "Node created successfully!",
        data: {
            node
        }
    });
});

// Controllet to change file content
// PATCH /api/v1/nodes/:id
const changeContent = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { content } = req.body;

    const file = await Node.findById(id);

    if (!file) {
        return next(new AppError("File not found!", 404));
    };

    await fileStorage.setContent(id, content);

    res.status(200).json({
        status: "success",
        message: "File content updated successfully!"
    });
});

// Controller to rename file / folder
// PATCH /api/v1/nodes/rename/:id
const renameNode = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;

    const node = await Node.findById(id);

    if (!node) {
        return next(new AppError("Node not found!", 404));
    };

    node.name = name;

    await node.save();

    res.status(200).json({
        status: "success",
        message: "Node renadem successfully!"
    });
});

// Controller to delete file / folder
// DELETE /api/v1/nodes/:id
const deleteFileFolder = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const node = await Node.findById(id);

    if (!node) {
        return next(new AppError("Node not found!", 404));
    };

    if (node.type === "folder") {
        await Node.deleteMany({ parentId: node._id });
    };

    await Node.findByIdAndDelete(id);

    res.status(200).json({
        status: "success",
        message: "Node deleted successfully!"
    });
});

module.exports = { getFileTree, getFileContent, createNode, changeContent, renameNode, deleteFileFolder }