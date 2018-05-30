//================Required Modules===========================

const express = require('express');
const bodyParser = require('body-parser');
const dbClient = require('./config/database');
const port = process.env.PORT || 3000;
const Router = express.Router();
const app = express();
const orderid = require('order-id')('CoolBeans');
const emailer = require('./modules/email');

//================Middleware================================

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


dbClient.connect()
    .then(res => console.log("Database is connected."))
    .catch(err => console.log("Database not connected"));

//=============Routes and configuration======================

app.use('/api/v1', Router);

app.get('/',(req,res)=>{
    var id = orderid.generate();
    dbClient.query("SELECT * From menu_category")
    .then(result => res.status(200).render('index',{cat: result.rows, orderNo: orderid.getTime(id)}))
    .catch(e => res.status(500).send(e));
});

app.get('/summary/:orderNo',(req,res)=>{
    var id = orderid.generate();
    var order_no = req.params.orderNo.toString();
    queryString = "SELECT menu_items.name, orders.order_id, orders.price, orders.order_no, menu_items.description, menu_items.menuitem_id FROM menu_items INNER JOIN orders ON menu_items.menuitem_id = orders.menuitem_id WHERE orders.order_no = '" + order_no + "'";
    dbClient.query(queryString)
    .then((result) => {
        var sumtotal = 0;
        result.rows.forEach(function(item){
            sumtotal += item.price;
        })
        res.status(200).render("summary", 
        {
            order: result.rows,
            total: sumtotal,
            title: "Summary"
        })
    })
    .catch(e => console.error(e.stack));
});

Router.route('/menucategories')
    .get((req,res) => {
        dbClient.query('SELECT * FROM menu_category')
        .then(result => res.status(200).json(result.rows))
        .catch(e => res.status(500).send(e));
    })
    .post((req,res) => {
        var query = "INSERT INTO menu_category (name) VALUES (" + "'" + req.body.name + "'" + ")";
        dbClient.query(query)
        .then(result => res.status(201).send({message: "menu category added successfully"}))
        .catch(e => res.status(500).send(e));
    })

Router.route('/menucategories/:id')
    .get((req,res) => {
        dbClient.query('SELECT * FROM menu_category WHERE category_id = ' + "'" + req.params.id + "'")
        .then((result) => {res.status(200).json(result.rows)})
        .catch(e => res.status(500).send(e));
    })
    .put((req,res) => {
        dbClient.query('SELECT * FROM menu_category WHERE category_id = ' + "'" + req.params.id + "'")
        .then((result) => {
            result.rows[0].name = req.body.name;
            var query = "UPDATE menu_category SET name = " + "'" + req.body.name + "'"  + "WHERE category_id = " + "'" + req.params.id + "'";
            dbClient.query(query)
            .then(result => res.status(200).send("resource updated successfully") )
            .catch(e => res.status(500).send(e));
            
        })
        .catch(e => console.error(e.stack))
    })
        
    .patch((req,res) => {
        dbClient.query('SELECT * FROM menu_category WHERE category_id = ' + "'" + req.params.id + "'")
        .then((result) => {
            result.rows[0].name = req.body.name;
            var query = "UPDATE menu_category SET name = " + "'" + req.body.name + "'"  + "WHERE category_id = " + "'" + req.params.id + "'";
            dbClient.query(query)
            .then(result => res.status(200).send("resource updated successfully") )
            .catch(e => res.status(500).send(e));
            
        })
        .catch(e => console.error(e.stack))
    });

Router.route('/menuitems')
    .get((req,res) => {
        dbClient.query("SELECT * FROM menu_items")
        .then(result => res.status(200).json(result.rows))
        .catch(e => console.error(e.stack));
    })
    .post((req,res) => {
        var query = "INSERT INTO menu_items (category_id, name, description,price) VALUES (" + "'" + req.body.categoryId + "'" + "," + "'" + req.body.name + "'" + "," + "'" + req.body.description + "'" + "," + "'" + req.body.price + "'" + ")";
        dbClient.query(query)
        .then(result => res.status(201).json(result.rows))
        .catch(e => console.error(e.stack));
    })

    Router.route('/menuitems/:id')
    .get((req,res) => {
        dbClient.query("SELECT * FROM menu_items WHERE menuItem_id = " + "'" + req.params.id + "'" )
        .then((result) => res.status(200).json(result.rows))
        .catch(e => console.error(e.stack));
    })
 
    Router.route('/menuitems/detailed')
    .get((req,res) => {
        dbClient.query("SELECT menu_category.category_id, menu_category.name , menu_items.category_id as menucat_id, menuitem_id, menu_items.name, menu_items.description, menu_items.price FROM menu_category INNER JOIN menu_items ON menu_category.category_id = menu_items.category_id")
        .then(result => res.status(200).json(result.rows))
        .catch(e => console.error(e.stack));
    });

    Router.route('/menuitems/:itemId')
    .get((req,res) => {
        dbClient.query("SELECT * FROM menu_items WHERE menuitem_id = " + req.params.itemId)
        .then(result => res.status(200).json(result.rows))
        .catch(e => console.error(e.stack));
    })

    Router.route('/menuitems/category/:itemCategoryId')
    .get((req,res) => {
        dbClient.query("SELECT * FROM menu_items WHERE category_id = " + req.params.itemCategoryId)
        .then(result => res.status(200).json(result.rows))
        .catch(e => console.error(e.stack));
    });

    Router.route('/orders')
        .get((req,res)=>{
            dbClient.query("SELECT * FROM ORDERS")
            .then(result => res.status(200).json(result.rows))
            .catch(e => console.log(e.stack));
        })

        .post((req,res)=>{

            
            req.body.forEach(function(item){
                console.log()
                dbClient.query("INSERT INTO orders(menuitem_id, price, order_no)VALUES(" + item.menuitem_id + "," + item.price +"," + item.order_no +")")
                .then((result) =>{ res.status(201).json({message: "Order: " + item.order_no + " added " + " Successfully"})})
                .catch(e => console.log(e.stack));
            });
            

                var mailOptions = {
                    from: 'admin@weliketoeat.co.za',
                    to: req.body[0].email,
                    subject: 'Thank you for your purchase',
                    text: 'Your order ' + req.body[0].order_no + " will be delivered shortly"
                  };

                var adminNotification = {
                    from: 'admin@weliketoeat.co.za',
                    to: 'admin@weliketoeat.co.za',
                    subject: "new order: " + req.body[0].order_no,
                    text: 'New order being dispatched:' + " " + req.body[0].order_no
                };
                
                sendEmail(adminNotification);
                sendEmail(mailOptions);
                res.status(200).send("ok");

        })

        .delete((req,res)=>{
            var query = "DELETE FROM orders WHERE order_id = " + "'" + req.body.order_id + "'";
            dbClient.query(query)
            .then(result => res.status(200).send("item_id: " + req.body.order_id + "was deleted"))
            .catch(e => console.log(e.stack));
        })


    Router.route('/orders/:orderNo')
        .get((req,res)=>{
            dbClient.query("SELECT * FROM orders WHERE order_no = " + "'" +req.params.orderNo +"'")
            .then(result => res.status(200).json(result.rows))
            .catch(e => console.log(e.stack));
        });

app.listen(port, (err) => {
    if(err)
        console.log("Server unable to start: " + err);
    else
        console.log("Server Started on port: " + port);
});

function sendEmail(options){
    emailer.sendMail(options,(err,info)=>{
        if(err)
            console.log(err);
        else
            console.log(info);
    });
}