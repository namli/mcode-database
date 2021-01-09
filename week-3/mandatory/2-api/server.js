const express = require("express");
const app = express();
const db = require("./db");
app.use(express.json());

// ---- Welcome Page-----

app.get("/", (req, res) => {
  res.send(`<h1>Wellcome to CYF Ecommerce API<h1>
  <h3>You can query ...</h3>
  <h4>all customers:  '/customers' <br>
  with id:  '/customers/id_no' <br>
  with string search in names:  '/customers/by_name/str' <h4> 
  <h4>You can also query suppliers '/suppliers' or products '/products'</h4> `);
});

// ------ Get All Customers-----------

app.get("/customers", function (req, res) {
  db.query(`SELECT * FROM customers`)
    .then((result) => {
      if (result) res.json(result.rows);
    })
    .catch((err) => res.status(500).json({ error: err }));
});

// --------- Get All Suppliers -----------

app.get("/suppliers", function (req, res) {
  db.query(`SELECT * FROM suppliers`, (error, result) => {
    if (!error) res.json(result.rows);
  });
});

// -----------Get Customers by ID-------------

app.get("/customers/:id", function (req, res) {
  let custId = Number(req.params.id);
  db.query("SELECT * FROM customers WHERE id = $1", [custId], function (
    error,
    result
  ) {
    if (!error) res.json(result.rows[0]);
  });
});

// ------------Filter Customers by Name search--------

app.get("/customers/by_name/:name", (req, res) => {
  let custName = req.params.name.toLowerCase();
  db.query(
    "SELECT * FROM customers WHERE LOWER(name) LIKE '%'||$1||'%'",
    [custName],
    (err, result) => {
      if (err == undefined) {
        res.status(200).json({ customers: result.rows });
      } else {
        console.log(err);
        res.status(400).json(err);
      }
    }
  );
});

//  Get Products & filtered Products on the same path---

// ---- Solution 1------------

app.get("/products", function (req, res) {
  const name = req.query.name;

  let allProducts = `SELECT products.product_name, pa.unit_price price, sup.supplier_name
  FROM products JOIN product_availability pa ON (products.id=pa.prod_id)
  JOIN suppliers sup ON (pa.supp_id=sup.id) `;

  let filteredProducts =
    allProducts + " WHERE LOWER(products.product_name) LIKE '%'||$1||'%'";

  !name
    ? db.query(allProducts, [], (error, result) => {
        if (!error) res.json(result.rows);
      })
    : db.query(filteredProducts, [name.toLowerCase()], (error, result) => {
        if (!error) res.json(result.rows);
      });
});

// ---- Solution 2------------

// app.get("/products", function (req, res) {
//   const name = req.query.name;

//   let query = `SELECT products.product_name, pa.unit_price price, sup.supplier_name
//   FROM products JOIN product_availability pa ON (products.id=pa.prod_id)
//   JOIN suppliers sup ON (pa.supp_id=sup.id)`;

//   let param = [];

//   if (name !== undefined) {
//     query = `SELECT products.product_name, pa.unit_price price, sup.supplier_name
//   FROM products JOIN product_availability pa ON (products.id=pa.prod_id)
//   JOIN suppliers sup ON (pa.supp_id=sup.id) WHERE LOWER(products.product_name) LIKE '%'||$1||'%'`;

//     param = [name.toLowerCase()];
//   }

//   db.query(query, param)
//     .then((result) => res.json(result.rows))
//     .catch((e) => console.log(e));
// });

// ------ Create New Cust -----------

app.post("/customers", (req, res) => {
  const custName = req.body.name;
  const custAddress = req.body.address;
  const custCity = req.body.city;
  const custCountry = req.body.country;
  db.query(
    "INSERT INTO customers (name, address, city, country) " +
      "VALUES ($1, $2, $3, $4) " +
      "RETURNING id",
    [custName, custAddress, custCity, custCountry],
    (err) => {
      if (err === undefined) {
        res.send("New customer added");
      } else {
        console.log(err);
        res.status(500).json({ error: err });
      }
    }
  );
});

// --------- Create New Product ---------

app.post("/products", (req, res) => {
  const productName = req.body.product_name;

  db.query(
    "INSERT INTO products (product_name) VALUES ($1) RETURNING id",
    [productName],
    (err) => {
      if (!err) res.send("New Producted Added");
      res.status(500).json({ error: err });
      console.log(err);
    }
  );
});

// !! ----------Create New Availability -----

app.post("/availability", (req, res) => {
  const suppId = req.body.supp_id;
  const price = req.body.unit_price;

  if (price <= 0 || !Number.isInteger(price)) {
    res.status(400).send("Please enter positive integer value for the price");
  } else {
    db.query(
      "SELECT prod_id, supp_id FROM product_availability WHERE supp_id=$1",
      [suppId],
      (err, result) => {
        if (!err) {
          if (result.rowCount < 2) res.send("You cannot do that!");
        }
      }
    );

    db.query(
      `INSERT INTO product_availability (supp_id, unit_price) VALUES ($1, $2)`,
      [suppId, price],
      (err) => {
        if (!err) res.send("New Product Availabity Added");
      }
    );
  }
});

//--------- Create a new order for a customer ----

app.post("/customers/:customerId/orders", (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const orderDate = req.body.order_date;
  const orderRef = req.body.order_reference;

  db.query(
    "SELECT * FROM customers WHERE id = $1",
    [customerId],
    (error, result) => {
      if (!error) {
        if (result.rowCount == 0) res.send("No customer with this ID");
      }
    }
  );

  db.query(
    `INSERT INTO orders (order_date, order_reference, customer_id)
  VALUES ($1, $2, $3)`,
    [orderDate, orderRef, customerId],
    (error) => {
      !error
        ? res.send("New order added for selected customer")
        : res.status(400).send({ error: error });
    }
  );
});

//----- Update an existing customer-------

app.put("/customers/:customerId", (req, res) => {
  const customerId = parseInt(req.params.customerId);

  const custName = req.body.name;
  const address = req.body.address;
  const city = req.body.city;
  const country = req.body.country;

  db.query(
    `UPDATE customers SET name=$2, address=$3, city=$4, country=$5 WHERE id=$1`,
    [customerId, custName, address, city, country],
    (error) => {
      if (!error) {
        res.send(`Customer ID ${customerId} has been modified`);
      } else {
        console.error(error);
        res.status(500).json({ error: error });
      }
    }
  );
});

// --------- Delete an existing order------

app.delete("/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;

  db.query("DELETE from order_items WHERE order_id = $1", [orderId], (err) => {
    if (!err)
      db.query("DELETE from orders WHERE id = $1", [orderId], (err) => {
        if (!err) res.send(`Order witht ID number ${orderId} deleted `);
      });
  });
});

// -------- Delete an existing customer with no order  ------

app.delete("/customers/:customerId", (req, res) => {
  let customerId = parseInt(req.params.customerId);
  db.query(
    "SELECT orders.* FROM orders JOIN customers ON orders.customer_id=customers.id WHERE customer_id = $1",
    [customerId],
    (err, result) => {
      if (!err) {
        if (result.rowCount > 0) {
          res.send(`Can't delete Customer ${customerId} with existing order`);
          return;
        }
      }
    }
  );
  db.query(
    "DELETE FROM customers WHERE id = $1",
    [customerId],
    (err, results) => {
      if (!err) {
        if (results.rowCount == 0) {
          res.send(`No customer with id number ${customerId}`);
        } else {
          res.send(`Customer ${customerId} has been deleted`);
        }
      }
    }
  );
});

//---------load all orders incl items for a specific customer -----

app.get("/customers/:customerId/orders", (req, res) => {
  const customerId = Number(req.params.customerId);

  db.query(
    `SELECT o.order_reference, o.order_date, p.product_name,
  pa.unit_price, sp.supplier_name, oi.quantity
  FROM orders o JOIN order_items oi ON (o.id=oi.order_id)
  JOIN product_availability pa ON (oi.supplier_id = pa.supp_id AND oi.product_id=pa.prod_id)
  JOIN products p ON (p.id=pa.prod_id)
  JOIN suppliers sp ON (sp.id=pa.supp_id)
  WHERE o.customer_id = $1`,
    [customerId],
    (error, result) => {
      if (!error) {
        if (result.rowCount > 0) {
          res.json(result.rows);
        } else {
          res.send(`No order for the customer ID number ${customerId}`);
        }
      }
    }
  );
});

const PORT = 6060;

app.listen(PORT, function () {
  console.log(`Server is listening on port ${PORT}`);
});
