const { randomBytes } = require("crypto");
const { encryptCookie, verifyCsrf } = require("./encryption");

const VError = require("../errors/verror");

const cookieParams = {
  httpOnly: true,
  sameSite: "strict",
  signed: true,
  maxAge: 50000000
};

function createToken(req, res, secret) {
  req.csrfToken = () => {
    const csrfToken = randomBytes(16).toString('hex'); // randomUUID();
    const cookieToken = encryptCookie(csrfToken, secret);

    res.cookie("csrfToken", cookieToken, cookieParams);

    return csrfToken;
  };
}

const csurf = (secret, forbiddenMethods, forbiddenRoutes) => {
  if (secret.length != 32) {
    throw new Error("Your secret is not the required 32 characters long");
  }
  if (!forbiddenMethods) forbiddenMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!forbiddenRoutes) forbiddenRoutes = ["create", "update", "delete"];

  return (req, res, next) => {
    if (!req.cookies || !res.cookie || !req.signedCookies) {
      throw new Error("No Cookie middleware is installed");
    }

    if (forbiddenMethods.includes(req.method)) {
      let protected = false;
      const testPath = req.path ? req.path.split('/') : null;

      if (testPath && (testPath.length > 0 || forbiddenRoutes.length > 0)) {
        forbiddenRoutes.forEach((r) => {
          if ((new RegExp(r)).test(testPath[testPath.length-1])) {
            protected = true;
          }
        });
      } else {
        protected = true;
      }

      if (protected) {
        const { csrfToken } = req.signedCookies;

        if (
          csrfToken != undefined && req.body._csrf &&
          verifyCsrf(req.body._csrf, csrfToken, secret)
        ) {
          // allow multiple
          // res.cookie("csrfToken", null, cookieParams);
          return next();
        } else {
          const pcsrf = req.body._csrf ? req.body._csrf : null;
          console.log(`Did not get a valid CSRF token for '${req.method} ${req.originalUrl}': ${pcsrf} v. ${csrfToken}`);

          next(new VError(401, 'Unauthorized'));
        }
      }
    } else {
      createToken(req, res, secret);
    }

    return next();
  };
};

module.exports = csurf;
