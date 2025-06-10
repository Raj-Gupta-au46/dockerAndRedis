import { expect } from "chai";
import sinon from "sinon";

import AuthController from "../controllers/auth.controller";
import { UserSchema } from "../models";
import { JwtService, PasswordHasServices } from "../services";
import * as helper from "../helper";

describe("AuthController", () => {
  let authController;
  let req;
  let res;
  let next;
  let userSchemaMock;
  let jwtServiceMock;
  let passwordHashServiceMock;
  let fieldValidateErrorStub;

  beforeEach(() => {
    authController = new AuthController();

    req = {
      body: {},
      payload: {},
    };

    res = {
      json: sinon.spy(),
    };

    next = sinon.spy();

    // Create stubs and mocks
    userSchemaMock = sinon.mock(UserSchema);

    jwtServiceMock = sinon.createStubInstance(JwtService);
    sinon.stub(JwtService.prototype, "accessTokenGenerator");

    passwordHashServiceMock = sinon.createStubInstance(PasswordHasServices);
    sinon.stub(PasswordHasServices.prototype, "hash");
    sinon.stub(PasswordHasServices.prototype, "compare");

    fieldValidateErrorStub = sinon.stub(helper, "fieldValidateError");
  });

  afterEach(() => {
    userSchemaMock.restore();
    sinon.restore();
  });

  describe("register", () => {
    it("should successfully register a new user", async () => {
      // Setup test data
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      // Mock UserSchema.findOne to return null (no duplicate user)
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .resolves(null);

      // Mock password hashing
      PasswordHasServices.prototype.hash.resolves("hashedPassword123");

      // Mock UserSchema.create to return a new user
      const createdUser = {
        _id: "123456789",
        name: req.body.name,
        email: req.body.email,
        role: "SUPER-ADMIN",
        toObject: () => ({
          _id: "123456789",
          name: req.body.name,
          email: req.body.email,
          role: "SUPER-ADMIN",
        }),
      };
      userSchemaMock
        .expects("create")
        .withArgs(
          sinon.match({
            name: req.body.name,
            email: req.body.email,
            password: "hashedPassword123",
            role: "SUPER-ADMIN",
          })
        )
        .resolves(createdUser);

      // Call the method
      await authController.register(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        success: {
          message: "You are register successfully ",
          data: createdUser.toObject(),
        },
      });
      userSchemaMock.verify();
    });

    it("should return conflict error for duplicate email", async () => {
      // Setup test data
      req.body = {
        name: "Test User",
        email: "existing@example.com",
        password: "password123",
      };

      // Mock UserSchema.findOne to return an existing user
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .resolves({
          _id: "existingId",
          email: req.body.email,
        });

      // Call the method
      await authController.register(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal(
        "This email is already exit"
      );
      expect(next.firstCall.args[0].statusCode).to.equal(409); // Conflict
      userSchemaMock.verify();
    });

    it("should handle internal server error during user creation", async () => {
      // Setup test data
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      // Mock UserSchema.findOne to return null (no duplicate user)
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .resolves(null);

      // Mock password hashing
      PasswordHasServices.prototype.hash.resolves("hashedPassword123");

      // Mock UserSchema.create to fail
      userSchemaMock.expects("create").rejects(new Error("Database error"));

      // Call the method
      await authController.register(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Database error");
      userSchemaMock.verify();
    });
  });
  // check for login and testing other methods here
  describe("login", () => {
    it("should successfully login a user", async () => {
      // Setup test data
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      const userData = {
        _id: "123456789",
        email: req.body.email,
        password: "hashedPassword123",
        isVerified: true,
        status: "active",
        isBlocked: false,
        role: "SUPER-ADMIN",
      };

      const userDataWithoutPassword = {
        _id: "123456789",
        name: "Test User",
        email: req.body.email,
      };

      // Mock UserSchema.findOne for authentication
      const selectMock = sinon.stub().returns(userData);
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .returns({ select: selectMock });

      // Mock password comparison
      PasswordHasServices.prototype.compare.resolves(true);

      // Mock JWT token generation
      JwtService.prototype.accessTokenGenerator.resolves("jwt-token-123");

      // Mock UserSchema.findOne for user data
      const selectMock2 = sinon.stub().returns(userDataWithoutPassword);
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .returns({ select: selectMock2 });

      // Call the method
      await authController.login(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        message: "LOGIN SUCCESSFULLY",
        data: {
          token: "jwt-token-123",
          user: sinon.match.object,
          userData: userDataWithoutPassword,
        },
      });
      userSchemaMock.verify();
    });

    it("should return not found error when user does not exist", async () => {
      // Setup test data
      req.body = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      // Mock UserSchema.findOne to return null
      const selectMock = sinon.stub().returns(null);
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .returns({ select: selectMock });

      // Call the method
      // testing
      await authController.login(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("User not found !");
      expect(next.firstCall.args[0].statusCode).to.equal(404); // Not Found
      userSchemaMock.verify();
    });

    it("should return not found error when password is incorrect", async () => {
      // Setup test data
      req.body = {
        email: "test@example.com",
        password: "wrongPassword",
      };

      const userData = {
        _id: "123456789",
        email: req.body.email,
        password: "hashedPassword123",
        isVerified: true,
        status: "active",
        isBlocked: false,
        role: "SUPER-ADMIN",
      };

      // Mock UserSchema.findOne
      const selectMock = sinon.stub().returns(userData);
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .returns({ select: selectMock });

      // Mock password comparison to return false
      PasswordHasServices.prototype.compare.resolves(false);

      // Call the method
      await authController.login(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Password is incorrect");
      expect(next.firstCall.args[0].statusCode).to.equal(404); // Not Found
      userSchemaMock.verify();
    });

    it("should handle unauthorized error when token generation fails", async () => {
      // Setup test data
      req.body = {
        email: "test@example.com",
        password: "password123",
      };

      const userData = {
        _id: "123456789",
        email: req.body.email,
        password: "hashedPassword123",
        isVerified: true,
        status: "active",
        isBlocked: false,
        role: "SUPER-ADMIN",
      };

      // Mock UserSchema.findOne for authentication
      const selectMock = sinon.stub().returns(userData);
      userSchemaMock
        .expects("findOne")
        .withArgs({ email: req.body.email })
        .returns({ select: selectMock });

      // Mock password comparison
      PasswordHasServices.prototype.compare.resolves(true);

      // Mock JWT token generation to fail
      JwtService.prototype.accessTokenGenerator.resolves(null);

      // Call the method
      await authController.login(req, res, next);

      // Assertions
      expect(fieldValidateErrorStub.calledOnce).to.be.true;
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Token generate failed.");
      expect(next.firstCall.args[0].statusCode).to.equal(401); // Unauthorized
      userSchemaMock.verify();
    });
  });

  describe("self", () => {
    it("should return user data for authenticated user", async () => {
      // Setup test data
      req.payload = {
        userId: "123456789",
      };

      const userData = {
        _id: "123456789",
        name: "Test User",
        email: "test@example.com",
        role: "SUPER-ADMIN",
      };

      // Mock UserSchema.findOne
      const selectMock = sinon.stub().returns(userData);
      userSchemaMock
        .expects("findOne")
        .withArgs({ _id: req.payload.userId })
        .returns({ select: selectMock });

      // Call the method
      await authController.self(req, res, next);

      // Assertions
      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0]).to.deep.include({
        status: "SUCCESS",
        data: userData,
      });
      userSchemaMock.verify();
    });

    it("should handle errors during self data retrieval", async () => {
      // Setup test data
      req.payload = {
        userId: "123456789",
      };

      // Mock UserSchema.findOne to throw an error
      userSchemaMock
        .expects("findOne")
        .withArgs({ _id: req.payload.userId })
        .throws(new Error("Database error"));

      // Call the method
      await authController.self(req, res, next);

      // refactor

      // Assertions
      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0].message).to.equal("Database error");
      userSchemaMock.verify();
    });
  });
});

// applying testcase

// for modification

// checking for pr

// after merging
