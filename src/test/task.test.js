import { expect } from "chai";
import sinon from "sinon";
import { Request, Response, NextFunction } from "express";
import TaskController from "../controllers/TaskController";
import { TaskSchema } from "../models";
import * as helper from "../helper";
import * as mongoose from "mongoose";

describe("TaskController", () => {
  let taskController;
  let req;
  let res;
  let next;
  let taskSchemaMock;
  let fieldValidateErrorStub;
  let isValidObjectIdStub;

  beforeEach(() => {
    taskController = new TaskController();

    req = {
      body: {},
      params: {},
      query: {},
      payload: {},
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    next = sinon.spy();

    // Create stubs and mocks
    taskSchemaMock = sinon.mock(TaskSchema);
    fieldValidateErrorStub = sinon.stub(helper, "fieldValidateError");
    isValidObjectIdStub = sinon.stub(mongoose, "isValidObjectId");
  });

  afterEach(() => {
    taskSchemaMock.restore();
    sinon.restore();
  });

  describe("createTask", () => {
    it("should successfully create a task", async () => {
      // Setup test data
      req.body = {
        title: "Test Task",
        description: "This is a test task",
        status: "IN-PROGRESS",
        deuDate: "2025-12-31",
        assignedTo: "60d21b4667d0d8992e610c85",
      };
      req.payload = {
        userId: "60d21b4667d0d8992e610c86",
      };

      const taskData = {
        title: req.body.title,
        description: req.body.description,
        status: req.body.status,
        userId: req.payload.userId,
        deuDate: new Date(req.body.deuDate),
        assignedTo: req.body.assignedTo,
      };

      const createdTask = {
        _id: "60d21b4667d0d8992e610c87",
        ...taskData,
      };

      // Mock TaskSchema.create
      taskSchemaMock
        .expects("create")
        .withArgs(sinon.match(taskData))
        .resolves(createdTask);

      // Call the method
      await taskController.createTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        success: {
          message: "Task created successfully",
          data: createdTask,
        },
      });
      taskSchemaMock.verify();
    });

    it("should handle internal server error during task creation", async () => {
      // Setup test data
      req.body = {
        title: "Test Task",
        description: "This is a test task",
      };
      req.payload = {
        userId: "60d21b4667d0d8992e610c86",
      };

      // Mock TaskSchema.create to fail
      taskSchemaMock.expects("create").rejects(new Error("Database error"));

      // Call the method
      await taskController.createTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Database error");
      taskSchemaMock.verify();
    });

    it("should handle case when task creation returns null", async () => {
      // Setup test data
      req.body = {
        title: "Test Task",
        description: "This is a test task",
      };
      req.payload = {
        userId: "60d21b4667d0d8992e610c86",
      };

      // Mock TaskSchema.create to return null
      taskSchemaMock.expects("create").resolves(null);

      // Call the method
      await taskController.createTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal(
        "Something went wrong, task not created."
      );
      expect(next.firstCall.args[0].statusCode).to.equal(500); // Internal Server Error
      taskSchemaMock.verify();
    });
  });

  describe("getTaskById", () => {
    it("should successfully get a task by ID", async () => {
      // Setup test data
      req.params = {
        id: "60d21b4667d0d8992e610c87",
      };

      const task = {
        _id: req.params.id,
        title: "Test Task",
        description: "This is a test task",
        status: "IN-PROGRESS",
        isDeleted: false,
      };

      // Mock isValidObjectId
      isValidObjectIdStub.returns(true);

      // Mock TaskSchema.findOne
      const populateStub1 = sinon.stub().returnsThis();
      const populateStub2 = sinon.stub().returns(task);
      taskSchemaMock
        .expects("findOne")
        .withArgs({ _id: req.params.id, isDeleted: false })
        .returns({
          populate: populateStub1,
        });
      populateStub1.returns({
        populate: populateStub2,
      });

      // Call the method
      await taskController.getTaskById(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        data: task,
      });
      taskSchemaMock.verify();
    });

    it("should return bad request for invalid task ID format", async () => {
      // Setup test data
      req.params = {
        id: "invalid-id",
      };

      // Mock isValidObjectId to return false
      isValidObjectIdStub.returns(false);

      // Call the method
      await taskController.getTaskById(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Invalid task ID format");
      expect(next.firstCall.args[0].statusCode).to.equal(400); // Bad Request
    });

    it("should return not found when task does not exist", async () => {
      // Setup test data
      req.params = {
        id: "60d21b4667d0d8992e610c87",
      };

      // Mock isValidObjectId
      isValidObjectIdStub.returns(true);

      // Mock TaskSchema.findOne to return null
      const populateStub1 = sinon.stub().returnsThis();
      const populateStub2 = sinon.stub().returns(null);
      taskSchemaMock
        .expects("findOne")
        .withArgs({ _id: req.params.id, isDeleted: false })
        .returns({
          populate: populateStub1,
        });
      populateStub1.returns({
        populate: populateStub2,
      });

      // Call the method
      await taskController.getTaskById(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Task not found");
      expect(next.firstCall.args[0].statusCode).to.equal(404); // Not Found
      taskSchemaMock.verify();
    });
  });

  describe("getAllTasks", () => {
    it("should get all tasks with no filters", async () => {
      // Setup test data
      req.query = {};

      const tasks = [
        {
          _id: "60d21b4667d0d8992e610c87",
          title: "Task 1",
          description: "This is task 1",
          status: "IN-PROGRESS",
          isDeleted: false,
        },
        {
          _id: "60d21b4667d0d8992e610c88",
          title: "Task 2",
          description: "This is task 2",
          status: "DONE",
          isDeleted: false,
        },
      ];

      // Mock TaskSchema.find
      const populateStub1 = sinon.stub().returnsThis();
      const populateStub2 = sinon.stub().returnsThis();
      const sortStub = sinon.stub().returns(tasks);
      taskSchemaMock.expects("find").withArgs({ isDeleted: false }).returns({
        populate: populateStub1,
      });
      populateStub1.returns({
        populate: populateStub2,
      });
      populateStub2.returns({
        sort: sortStub,
      });

      // Call the method
      await taskController.getAllTasks(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        data: tasks,
      });
      taskSchemaMock.verify();
    });

    it("should get tasks with status filter", async () => {
      // Setup test data
      req.query = {
        status: "IN-PROGRESS",
      };

      const tasks = [
        {
          _id: "60d21b4667d0d8992e610c87",
          title: "Task 1",
          description: "This is task 1",
          status: "IN-PROGRESS",
          isDeleted: false,
        },
      ];

      // Mock TaskSchema.find
      const populateStub1 = sinon.stub().returnsThis();
      const populateStub2 = sinon.stub().returnsThis();
      const sortStub = sinon.stub().returns(tasks);
      taskSchemaMock
        .expects("find")
        .withArgs({ isDeleted: false, status: "IN-PROGRESS" })
        .returns({
          populate: populateStub1,
        });
      populateStub1.returns({
        populate: populateStub2,
      });
      populateStub2.returns({
        sort: sortStub,
      });

      // Call the method
      await taskController.getAllTasks(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        data: tasks,
      });
      taskSchemaMock.verify();
    });

    it("should get tasks with due date filter", async () => {
      // Setup test data
      const dueDate = "2025-12-31";
      req.query = {
        dueDate,
      };

      const tasks = [
        {
          _id: "60d21b4667d0d8992e610c87",
          title: "Task 1",
          description: "This is task 1",
          status: "IN-PROGRESS",
          deuDate: new Date(dueDate),
          isDeleted: false,
        },
      ];

      // Mock TaskSchema.find
      const populateStub1 = sinon.stub().returnsThis();
      const populateStub2 = sinon.stub().returnsThis();
      const sortStub = sinon.stub().returns(tasks);
      taskSchemaMock
        .expects("find")
        .withArgs({
          isDeleted: false,
          deuDate: { $lte: sinon.match.date },
        })
        .returns({
          populate: populateStub1,
        });
      populateStub1.returns({
        populate: populateStub2,
      });
      populateStub2.returns({
        sort: sortStub,
      });

      // Call the method
      await taskController.getAllTasks(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        data: tasks,
      });
      taskSchemaMock.verify();
    });

    it("should get tasks with userId filter", async () => {
      // Setup test data
      const userId = "60d21b4667d0d8992e610c86";
      req.query = {
        userId,
      };

      const tasks = [
        {
          _id: "60d21b4667d0d8992e610c87",
          title: "Task 1",
          description: "This is task 1",
          status: "IN-PROGRESS",
          userId,
          isDeleted: false,
        },
      ];

      // Mock isValidObjectId
      isValidObjectIdStub.returns(true);

      // Mock TaskSchema.find
      const populateStub1 = sinon.stub().returnsThis();
      const populateStub2 = sinon.stub().returnsThis();
      const sortStub = sinon.stub().returns(tasks);
      taskSchemaMock
        .expects("find")
        .withArgs({
          isDeleted: false,
          userId,
        })
        .returns({
          populate: populateStub1,
        });
      populateStub1.returns({
        populate: populateStub2,
      });
      populateStub2.returns({
        sort: sortStub,
      });

      // Call the method
      await taskController.getAllTasks(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(userId)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        data: tasks,
      });
      taskSchemaMock.verify();
    });
  });

  describe("updateTask", () => {
    it("should successfully update a task", async () => {
      // Setup test data
      req.params = {
        id: "60d21b4667d0d8992e610c87",
      };
      req.body = {
        title: "Updated Task",
        description: "This is an updated task",
        status: "DONE",
        deuDate: "2025-12-31",
      };

      const updatedTask = {
        _id: req.params.id,
        ...req.body,
        deuDate: new Date(req.body.deuDate),
      };

      // Mock isValidObjectId
      isValidObjectIdStub.returns(true);

      // Mock TaskSchema.findOneAndUpdate
      taskSchemaMock
        .expects("findOneAndUpdate")
        .withArgs(
          { _id: req.params.id, isDeleted: false },
          sinon.match({
            title: req.body.title,
            description: req.body.description,
            status: req.body.status,
            deuDate: sinon.match.date,
          }),
          { new: true, runValidators: true }
        )
        .resolves(updatedTask);

      // Call the method
      await taskController.updateTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        message: "Task updated successfully",
        data: updatedTask,
      });
      taskSchemaMock.verify();
    });

    it("should return bad request for invalid task ID format", async () => {
      // Setup test data
      req.params = {
        id: "invalid-id",
      };
      req.body = {
        title: "Updated Task",
      };

      // Mock isValidObjectId to return false
      isValidObjectIdStub.returns(false);

      // Call the method
      await taskController.updateTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Invalid task ID format");
      expect(next.firstCall.args[0].statusCode).to.equal(400); // Bad Request
    });

    it("should return not found when task does not exist for update", async () => {
      // Setup test data
      req.params = {
        id: "60d21b4667d0d8992e610c87",
      };
      req.body = {
        title: "Updated Task",
      };

      // Mock isValidObjectId
      isValidObjectIdStub.returns(true);

      // Mock TaskSchema.findOneAndUpdate to return null
      taskSchemaMock
        .expects("findOneAndUpdate")
        .withArgs(
          { _id: req.params.id, isDeleted: false },
          sinon.match({
            title: req.body.title,
          }),
          { new: true, runValidators: true }
        )
        .resolves(null);

      // Call the method
      await taskController.updateTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Task not found");
      expect(next.firstCall.args[0].statusCode).to.equal(404); // Not Found
      taskSchemaMock.verify();
    });
  });

  describe("deleteTask", () => {
    it("should successfully delete a task (soft delete)", async () => {
      // Setup test data
      req.params = {
        id: "60d21b4667d0d8992e610c87",
      };

      const deletedTask = {
        _id: req.params.id,
        title: "Task Title",
        isDeleted: true,
      };

      // Mock isValidObjectId
      isValidObjectIdStub.returns(true);

      // Mock TaskSchema.findOneAndUpdate
      taskSchemaMock
        .expects("findOneAndUpdate")
        .withArgs(
          { _id: req.params.id, isDeleted: false },
          { isDeleted: true },
          { new: true }
        )
        .resolves(deletedTask);

      // Call the method
      await taskController.deleteTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        message: "Task deleted successfully",
      });
      taskSchemaMock.verify();
    });

    it("should return bad request for invalid task ID format when deleting", async () => {
      // Setup test data
      req.params = {
        id: "invalid-id",
      };

      // Mock isValidObjectId to return false
      isValidObjectIdStub.returns(false);

      // Call the method
      await taskController.deleteTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Invalid task ID format");
      expect(next.firstCall.args[0].statusCode).to.equal(400); // Bad Request
    });

    it("should return not found when task does not exist for deletion", async () => {
      // Setup test data
      req.params = {
        id: "60d21b4667d0d8992e610c87",
      };

      // Mock isValidObjectId
      isValidObjectIdStub.returns(true);

      // Mock TaskSchema.findOneAndUpdate to return null
      taskSchemaMock
        .expects("findOneAndUpdate")
        .withArgs(
          { _id: req.params.id, isDeleted: false },
          { isDeleted: true },
          { new: true }
        )
        .resolves(null);

      // Call the method
      await taskController.deleteTask(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(isValidObjectIdStub.calledWith(req.params.id)).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Task not found");
      expect(next.firstCall.args[0].statusCode).to.equal(404); // Not Found
      taskSchemaMock.verify();
    });
  });
});
