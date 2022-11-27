const express = require("express");
const bcrypt = require("bcrypt");
const dbConnection = require("../lib/db2");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.render("users");
  }
  next();
};
const ifLoggedin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect("/home");
  }
  next();
};
// END OF CUSTOM MIDDLEWARE
// ROOT PAGE
router.get("/", ifNotLoggedin, (req, res, next) => {
  dbConnection
    .execute("SELECT name FROM doctors WHERE id=?", [req.session.userID])
    .then(([rows]) => {
      res.render("home", {
        name: rows[0].name,
      });
    });
}); // END OF ROOT PAGE

// REGISTER PAGE
router.post(
  "/register",
  ifLoggedin,
  // post data validation(using express-validator)
  [
    body("user_email", "Invalid email address!")
      .isEmail()
      .custom((value) => {
        return dbConnection
          .execute("SELECT email FROM doctors WHERE email=?", [value])
          .then(([rows]) => {
            if (rows.length > 0) {
              return Promise.reject("This E-mail already in use!");
            }
            return true;
          });
      }),
    body("user_name", "Username is Empty!").trim().not().isEmpty(),
    body("user_pass", "The password must be of minimum length 6 characters")
      .trim()
      .isLength({ min: 6 }),
  ], // end of post data validation
  (req, res, next) => {
    const validation_result = validationResult(req);
    const { user_name, user_pass, user_email, user_department } = req.body;
    // IF validation_result HAS NO ERROR
    if (validation_result.isEmpty()) {
      // password encryption (using bcryptjs)
      bcrypt
        .hash(user_pass, 12)
        .then((hash_pass) => {
          // INSERTING USER INTO DATABASE
          dbConnection
            .execute(
              "INSERT INTO doctors(name, email, password, department) VALUES(?,?,?,?)",
              [user_name, user_email, hash_pass, user_department]
            )
            .then((result) => {
              res.send(
                `Your account has been created successfully, Now you can <a href="/users">Login</a>`
              );
            })
            .catch((err) => {
              // THROW INSERTING USER ERROR'S
              if (err) throw err;
            });
        })
        .catch((err) => {
          // THROW HASING ERROR'S
          if (err) throw err;
        });
    } else {
      // COLLECT ALL THE VALIDATION ERRORS
      let allErrors = validation_result.errors.map((error) => {
        return error.msg;
      });
      // REDERING login-register PAGE WITH VALIDATION ERRORS
      res.render("users", {
        register_error: allErrors,
        old_data: req.body,
      });
    }
  }
); // END OF REGISTER PAGE

// LOGIN PAGE
router.post(
  "/login",
  ifLoggedin,
  [
    body("user_email").custom((value) => {
      return dbConnection
        .execute("SELECT email FROM doctors WHERE email=?", [value])
        .then(([rows]) => {
          if (rows.length == 1) {
            return true;
          }
          return Promise.reject("Invalid Email Address!");
        });
    }),
    body("user_pass", "Password is empty!").trim().not().isEmpty(),
  ],
  (req, res) => {
    const validation_result = validationResult(req);
    const { user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
      dbConnection
        .execute("SELECT * FROM doctors WHERE email=?", [user_email])
        .then(([rows]) => {
          bcrypt
            .compare(user_pass, rows[0].password)
            .then((compare_result) => {
              if (compare_result === true) {
                req.session.isLoggedIn = true;
                req.session.userID = rows[0].id;
                res.redirect("/users/home");
              } else {
                res.render("users", {
                  login_errors: ["Invalid Password!"],
                });
              }
            })
            .catch((err) => {
              if (err) throw err;
            });
        })
        .catch((err) => {
          if (err) throw err;
        });
    } else {
      let allErrors = validation_result.errors.map((error) => {
        return error.msg;
      });
      // REDERING login-register PAGE WITH LOGIN VALIDATION ERRORS
      res.render("users", {
        login_errors: allErrors,
      });
    }
  }
);
// จบ login page

// logout
router.get("/logout", (req, res) => {
  // ทำลาย session
  req.session = null;
  res.redirect("/");
});
// จบ login

// หาพาร์ทมั่ว
router.use("/", (req, res) => {
  res.status(404).send("<h1>404 Page Not Found!</h1>");
});

module.exports = router;
