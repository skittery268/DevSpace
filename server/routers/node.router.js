// Modules
const express = require("express");

// Controllers
const { getFileTree, getFileContent, createNode, changeContent, renameNode, deleteFileFolder } = require("../controllers/node.controller");

// -------------------------------------IMPORTS-------------------------------------

const nodeRouter = express.Router();

// Route to get project file tree
nodeRouter.get("/:projectId", getFileTree);
// Route to get file content
nodeRouter.get("/content/:id", getFileContent);
// Route to create new file / folder
nodeRouter.post("/:projectId", createNode);
// Route to change file content
nodeRouter.patch("/:id", changeContent);
// Route to rename file / folder
nodeRouter.patch("/rename/:id", renameNode);
// Route to delete file / folder
nodeRouter.delete("/:id", deleteFileFolder);

module.exports = nodeRouter;