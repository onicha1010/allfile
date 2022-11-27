// const e = require('express'); // คืออะไรอ่ะ??
const { application } = require('express');
let express = require('express');
let router = express.Router();
let dbCon = require('../lib/db');

// display new page
router.get('/', (req,res, next) => {
    let sql = 'select * from pills order by id asc'
    dbCon.query(sql, (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('pills', { data: '' });
        } else {
            res.render('pills', { data: rows });
        }
    })
})

// display add med page
router.get('/add', (req, res, next) => {
    res.render('pills/add', {
        name: '',
        author: '',
        details: ''
    })
})


//add a new med
router.post('/add', (req, res, next) => {
    const {name, author, detail} = req.body
    let errors = false;

    if (name.length === 0 || author.length === 0) {
        errors = true;
        // set flash message
        req.flash('error', 'Please enter name, author and details');
        // render to add.ejs with flash message
        res.render('pills/add', {
            name: name,
            author: author,
            details: detail
        })
    }

    // if no error // สร้าง obj และเก็บข้อมูลเป็น obj
    if (!errors) {
        let form_data = {
            name: name,
            author: author,
            details: detail
        }

        // insert query
        dbCon.query('INSERT INTO pills SET ?', form_data, (err, result) => {
            if (err) {
                req.flash('error', err)

                res.render('pills/add', {
                    name: form_data.name,
                    author: form_data.author,
                    details: form_data.details
                })
            } else {
                req.flash('success', 'Medicine successfully added');
                res.redirect('/pills');
            }
        })
    }
})


// display edit new page
router.get('/edit/:id', (req, res, next) => {
    let id = req.params.id;
    let sql2 = 'select * from pills where id = ' + id
    dbCon.query(sql2, (err, rows, fields) => {
        if (rows.length <= 0) {
            req.flash('error', 'Medicine not found with id = ' + id);
            res.redirect('/pills');
        } else {
            res.render('pills/edit', {
                title: 'Edit Medicine',
                id: rows[0].id,
                name: rows[0].name,
                author: rows[0].author,
                details: rows[0].details,
            })
        }
    })
})

// update new page
router.post('/update/:id', (req, res, next) => {
    let id = req.params.id;
    const {name, author, detail} = req.body
    let errors = false;

    if (name.length === 0 || author.length === 0) {
        errors = true;
        req.flash('error', 'Please enter name author and detail');
        res.render('pills/edit', {
            id: req.params.id,
            name: name,
            author: author,
            details: detail
        })
    }
    // if no error
    if (!errors) {
        let form_data = {
            name: name,
            author: author,
            details: detail
        }
        // update query
        dbCon.query("UPDATE pills SET ? WHERE id = " + id, form_data, (err, result) => {
            if (err) {
                req.flash('error', err);
                res.render('pills/edit', {
                    id: req.params.id,
                    name: form_data.name,
                    author: form_data.author,
                    details: form_data.details
                })
            } else {
                req.flash('success', 'Medicine successfully updated');
                res.redirect('/pills')
            }
        })
    }
})

// delete book 
router.get('/delete/(:id)', (req, res, next) => {
    let id = req.params.id;
    dbCon.query('delete from pills where id = ' + id, (err, result) => {
        if (err) {
            req.flash('error', err),
            res.redirect('/pills');
        } else {
            req.flash('success', 'Medicine successfully deleted! ID = ' + id);
            res.redirect('/pills');
        }
    })
})


//display detail page
// // router.get('/detail/:id', (req,res, next) => {
// //     let id = req.params.id;
// //     dbCon.query('select * from new_healthcare where id = ', (err, rows) => {
// //         if (err) {
// //             req.flash('error', err);
// //             res.render('detail', { data: '' });
// //         } else {
// //             res.render('detail', { data: rows });
// //         }
// //     })
// // })


// display detail page
router.get('/detail/:id', (req, res, next) => {
    let id = req.params.id;
    dbCon.query('select * from pills where id = ' + id, (err, rows, fields) => {
        if (rows.length <= 0) {
            req.flash('error', 'Medicine not found with id = ' + id);
            res.redirect('/pills');
        } else {
            res.render('pills/detail', {
                title: 'Deatil Medicine',
                id: rows[0].id,
                name: rows[0].name,
                author: rows[0].author,
                details: rows[0].details,
            })
        }
    })
})



module.exports = router;