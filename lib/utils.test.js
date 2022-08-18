const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const rewire = require("rewire");

var crypto = require("crypto");
var config = require("./config");
var utils = require("./utils");

var sandbox = sinon.createSandbox();

describe("utils", () => {
  let secretStub, digestStub, updateStub, createHashStub, hash;

  beforeEach(() => {
    secretStub = sandbox.stub(config, "secret").returns("fake_secret");
    digestStub = sandbox.stub().returns("ABC123");
    updateStub = sandbox.stub().returns({ digest: digestStub });
    createHashStub = sandbox.stub(crypto, "createHash").returns({
      update: updateStub,
    });
    hash = utils.getHash("secret");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return null when getHash is called with no parameter or not a string", () => {
    sandbox.reset();

    const hash2 = utils.getHash();
    const hash3 = utils.getHash(123);
    const hash4 = utils.getHash({});

    expect(hash2).to.equal(null);
    expect(hash3).to.equal(null);
    expect(hash4).to.equal(null);
    expect(createHashStub).to.not.have.been.called;
  });

  it("should get the secret from config", () => {
    expect(secretStub).to.have.been.called;
  });

  it("should call crypto with correct settings", () => {
    expect(createHashStub).to.have.been.calledWith("md5");
    expect(updateStub).to.have.been.calledWith("secret_fake_secret");
    expect(digestStub).to.have.been.calledWith("hex");
  });

  it("should return a hash when getHash is called with a string", () => {
    expect(utils.getHash("testString")).to.equal("ABC123");
  });
});
