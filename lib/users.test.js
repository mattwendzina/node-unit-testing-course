const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const rewire = require("rewire");

var mongoose = require("mongoose");

var users = require("./users");
var User = require("./models/user");

var sandbox = sinon.createSandbox();

describe("users", () => {
  let findStub;
  let sampleArgs;
  let sampleUser;

  beforeEach(() => {
    sampleUser = {
      id: 123,
      name: "foo",
      email: "foo@bar.com",
    };
    findStub = sandbox.stub(mongoose.model, "findById").resolves(sampleUser);
  });

  afterEach(() => {
    sandbox.restore();
  });

  context("get", () => {
    it("should check for an id", (done) => {
      users.get(null, (err, result) => {
        expect(err).to.exist;
        expect(err.message).to.equal("Invalid user id");
        done();
      });
    });
  });
});
