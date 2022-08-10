const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
chai.use(sinonChai);
const rewire = require("rewire");

var mailer = rewire("./mailer");
var sandbox = sinon.createSandbox();

describe("mailer", () => {
  let emailStub;
  beforeEach(() => {
    emailStub = sandbox.stub().resolves("done");

    mailer.__set__("sendEmail", emailStub);
  });
  afterEach(() => {
    sandbox.restore();
    mailer = rewire("./mailer");
  });
  context("sendWelcomeEmail", () => {
    it("should throw a new error if no name or email is submitted", async () => {
      await expect(mailer.sendWelcomeEmail()).to.eventually.be.rejectedWith(
        "Invalid input"
      );
      await expect(
        mailer.sendWelcomeEmail("matt@wendzina.com")
      ).to.eventually.be.rejectedWith("Invalid input");
      await expect(
        mailer.sendWelcomeEmail(null, "matt wendzina")
      ).to.eventually.be.rejectedWith("Invalid input");
    });
    it("should call sendEmail when both an email address and name is passed into the function", async () => {
      await mailer.sendWelcomeEmail("matt@wendzina.com", "mattwendzina");
      expect(emailStub).to.have.been.calledWith(
        "matt@wendzina.com",
        "Dear mattwendzina, welcome to our family!"
      );
    });
  });
  context("sendPasswordResetEmail", () => {
    it("should thrown an error if there is no email address passed in", async () => {
      await expect(
        mailer.sendPasswordResetEmail()
      ).to.eventually.be.rejectedWith("Invalid input");
    });
    it("should call sendEmail when both an email address and name is passed into the function", async () => {
      await mailer.sendPasswordResetEmail("matt@wendzina.com");
      expect(emailStub).to.have.been.calledWith(
        "matt@wendzina.com",
        "Please click http://some_link to reset your password."
      );
    });
  });

  context("sendEmail", () => {
    let sendEmail;

    beforeEach(() => {
      mailer = rewire("./mailer");
      sendEmail = mailer.__get__("sendEmail");
    });
    it("should thrown an error if there is no email address or name passed in", async () => {
      await expect(emailStub).to.eventually.be.rejectedWith("Invalid inputs");
    });
    it("should call sendEmail with email and message", async () => {
      let result = await sendEmail("matt@wendzina", "welcome");
      expect(result).to.equal("Emails sent");
    });
  });
});
