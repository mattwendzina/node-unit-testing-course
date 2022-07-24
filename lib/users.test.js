const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const rewire = require("rewire");

var mongoose = require("mongoose");

var users = rewire("./users");
var User = require("./models/user");
var mailer = require("./mailer");
const { use } = require("chai");

var sandbox = sinon.createSandbox();

describe("users", () => {
  let findStub;
  let deleteStub;
  let sampleUser;
  let mailerStub;
  let saveMethod;
  beforeEach(() => {
    saveMethod = sandbox.stub().resolves("User successfully updated!");

    sampleUser = {
      id: 123,
      name: "foo",
      email: "foo@bar.com",
      save: saveMethod,
    };

    findStub = sandbox.stub(mongoose.Model, "findById").resolves(sampleUser);
    deleteStub = sandbox
      .stub(mongoose.Model, "remove")
      .resolves("user deleted successfully");
    mailerStub = sandbox
      .stub(mailer, "sendWelcomeEmail")
      .resolves("fake_email");
  });

  afterEach(() => {
    sandbox.restore();
    users = rewire("./users");
  });

  context.skip("get", () => {
    it("should check for an id", (done) => {
      users.get(null, (err, result) => {
        expect(err).to.exist;
        expect(err.message).to.equal("Invalid user id");
        done();
      });
    });
    it("should call findUserById with an id and return the result", (done) => {
      sandbox.restore();
      const stub = sandbox
        .stub(mongoose.Model, "findById")
        .yields(null, { name: "foo" });

      users.get(123, (err, result) => {
        expect(err).to.not.exist;
        expect(stub).to.have.been.called.calledOnce;
        expect(stub).to.have.been.called.calledWith(123);
        expect(result).to.be.a("object");
        expect(result).to.have.property("name").to.equal("foo");
        done();
      });
    });
    it("should catch error if there is one", (done) => {
      sandbox.restore();
      const stub = sandbox
        .stub(mongoose.Model, "findById")
        .yields(new Error("fake"));

      users.get(123, (err, result) => {
        expect(result).to.not.exist;
        expect(err).to.exist;
        expect(err).to.be.instanceOf(Error);
        expect(stub).to.have.been.calledWith(123);
        expect(err.message).to.equal("fake");
        done();
      });
    });
  });
  context.skip("delete", () => {
    it("should throw an error if no id is passed in", async () => {
      try {
        await users.delete();
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal("Invalid id");
        expect(deleteStub).to.not.have.been.called;
      }
    });
    it("should successfully delete a user", async () => {
      let result;
      try {
        result = await users.delete(123);
      } catch (e) {
        throw new Error("Unexpected success");
      }

      expect(result).to.exist;
      expect(result).to.equal("user deleted successfully");
      expect(deleteStub).to.have.been.called;
      expect(deleteStub).to.have.been.calledWith({ _id: 123 });
    });
  });

  context.skip("create", () => {
    let FakeUserClass, saveStub, result;

    beforeEach(async () => {
      saveStub = sandbox.stub().resolves(sampleUser);
      FakeUserClass = sandbox.stub().returns({ save: saveStub });
      users.__set__("User", FakeUserClass);
      result = await users.create(sampleUser);
    });
    it("should throw error if invalid data is passed in", async () => {
      await expect(users.create()).to.eventually.be.rejectedWith(
        "Invalid arguments"
      );
      await expect(
        users.create({ name: "matt" })
      ).to.eventually.be.rejectedWith("Invalid arguments");
      await expect(
        users.create({ email: "matt@test.com" })
      ).to.eventually.be.rejectedWith("Invalid arguments");
    });

    it("should call User with new ", async () => {
      expect(FakeUserClass).to.have.been.calledWithNew;
      expect(FakeUserClass).to.have.been.calledWith(sampleUser);
    });

    it("should save the user", () => {
      expect(saveStub).to.have.been.called;
    });

    it("should call mailer with name and email", () => {
      expect(mailerStub).to.have.been.called;
      expect(mailerStub).to.have.been.calledWith(
        sampleUser.email,
        sampleUser.name
      );
    });

    it("should reject errors", async () => {
      saveStub.rejects(new Error("fake"));
      await expect(users.create(sampleUser)).to.eventually.be.rejectedWith(
        "fake"
      );
    });
  });
  context.skip("update", () => {
    it("should call findById with id passed in", async () => {
      await users.update(123, { sampleUser });
      expect(findStub).to.have.been.calledWith(123);
    });

    it("should call user.save()", async () => {
      await users.update(123, sampleUser);
      expect(saveMethod).to.have.been.calledOnce;
    });

    it("should return success message when user is saved", async () => {
      const updatedUser = {
        id: 321,
        name: "bar",
        email: "bar@foo.com",
      };
      const result = await users.update(123, updatedUser);

      expect(result).to.equal("User successfully updated!");
    });
    it("should reject errors", async () => {
      findStub.throws(new Error("fake"));
      await expect(users.update(sampleUser)).to.eventually.be.rejectedWith(
        "fake"
      );
    });
  });
  context("reset password", () => {
    it("should call sendPasswordResetEmail with email address", () => {
      sandbox.stub(mailer, "sendPasswordResetEmail").resolves();
      users.resetPassword("test@email.com");
      expect(mailer.sendPasswordResetEmail).to.have.been.calledWith(
        "test@email.com"
      );
    });
    it("should return an error if no email is passed in", async () => {
      await expect(users.resetPassword()).to.eventually.be.rejectedWith(
        "Invalid email"
      );
    });
  });
});
