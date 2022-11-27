// const e = require('express'); // คืออะไรอ่ะ??
const { application } = require("express");
let express = require("express");
let router = express.Router();
let dbCon = require("../lib/db");

// display new page
router.get("/", (req, res, next) => {
  let sql = "select * from new_healthcare order by id asc";
  dbCon.query(sql, (err, rows) => {
    if (err) {
      req.flash("error", err);
      res.render("new", { data: "" });
    } else {
      res.render("new", { data: rows });
    }
  });
});

// display add new page
router.get("/add", (req, res, next) => {
  res.render("new/add", {
    name: "",
    author: "",
    details: "",
  });
});

//add a new New
router.post("/add", (req, res, next) => {
  const { name, author, detail } = req.body;
  let errors = false;

  if (name.length === 0 || author.length === 0) {
    errors = true;
    // set flash message
    req.flash("error", "Please enter name, author and details");
    // render to add.ejs with flash message
    res.render("new/add", {
      name: name,
      author: author,
      details: detail,
    });
  }

  // if no error // สร้าง obj และเก็บข้อมูลเป็น obj
  if (!errors) {
    let form_data = {
      name: name,
      author: author,
      details: detail,
    };

    // insert query
    dbCon.query(
      "INSERT INTO new_healthcare SET ?",
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);

          res.render("new/add", {
            name: form_data.name,
            author: form_data.author,
            details: form_data.details,
          });
        } else {
          req.flash("success", "News successfully added");
          res.redirect("/new");
        }
      }
    );
  }
});

// display edit new page
router.get("/edit/:id", (req, res, next) => {
  let id = req.params.id;
  let sql2 = "select * from new_healthcare where id = " + id;
  dbCon.query(sql2, (err, rows, fields) => {
    if (rows.length <= 0) {
      req.flash("error", "News not found with id = " + id);
      res.redirect("/new");
    } else {
      res.render("new/edit", {
        title: "Edit New",
        id: rows[0].id,
        name: rows[0].name,
        author: rows[0].author,
        details: rows[0].details,
      });
    }
  });
});

// update new page
router.post("/update/:id", (req, res, next) => {
  let id = req.params.id;
  const { name, author, detail } = req.body;
  let errors = false;

  if (name.length === 0 || author.length === 0) {
    errors = true;
    req.flash("error", "Please enter name author and detail");
    res.render("new/edit", {
      id: req.params.id,
      name: name,
      author: author,
      details: detail,
    });
  }
  // if no error
  if (!errors) {
    let form_data = {
      name: name,
      author: author,
      details: detail,
    };
    // update query
    dbCon.query(
      "UPDATE new_healthcare SET ? WHERE id = " + id,
      form_data,
      (err, result) => {
        if (err) {
          req.flash("error", err);
          res.render("new/edit", {
            id: req.params.id,
            name: form_data.name,
            author: form_data.author,
            details: form_data.details,
          });
        } else {
          req.flash("success", "News successfully updated");
          res.redirect("/new");
        }
      }
    );
  }
});

// delete book
router.get("/delete/(:id)", (req, res, next) => {
  let id = req.params.id;
  dbCon.query("delete from new_healthcare where id = " + id, (err, result) => {
    if (err) {
      req.flash("error", err), res.redirect("/new");
    } else {
      req.flash("success", "New successfully deleted! ID = " + id);
      res.redirect("/new");
    }
  });
});

//display detail page
// router.get('/detail/:id', (req,res, next) => {
//     let id = req.params.id;
//     dbCon.query('select * from new_healthcare where id = ', (err, rows) => {
//         if (err) {
//             req.flash('error', err);
//             res.render('detail', { data: '' });
//         } else {
//             res.render('detail', { data: rows });
//         }
//     })
// })

router.get("/detail/:id", (req, res, next) => {
  let id = req.params.id;
  dbCon.query(
    "select * from new_healthcare where id = " + id,
    (err, rows, fields) => {
      if (rows.length <= 0) {
        req.flash("error", "News not found with id = " + id);
        res.redirect("/new");
      } else {
        res.render("new/detail", {
          title: "Deatil New",
          id: rows[0].id,
          name: rows[0].name,
          author: rows[0].author,
          details: rows[0].details,
        });
      }
    }
  );
});

module.exports = router;
