const express = require('express'); // Nee to dowload express, body-parser, mysql
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.use(bodyParser.json());


const db = mysql.createConnection({
    host: "webcourse.cs.nuim.ie",
    //user: hidden,
   // password: hidden,
    //database: hidden
 });

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// CRUD
// Create
app.post('/user', (req, res) => {
  const userData = req.body;

  const sql = 'INSERT INTO USER (ID, FNAME, SNAME, MOBILE, EMAIL) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [userData.ID, userData.FNAME, userData.SNAME, userData.MOBILE, userData.EMAIL], (err, result) => {
    if (err) throw err;

    const userId = result.insertId;
    const homeAddress = userData.HOME_ADDRESS;
    const shippingAddress = userData.SHIPPING_ADDRESS;

    if (homeAddress) {
      saveAddress(userId, homeAddress, 'HOME_ADDRESS');
    }

    if (shippingAddress) {
      saveAddress(userId, shippingAddress, 'SHIPPING_ADDRESS');
    }

    res.send('User created successfully');
  });
});

// Save address
function saveAddress(userId, addressData, tableName) {
  const sql = `INSERT INTO ${tableName} (User_ID, Address_Line_1, Address_Line_2, Town, County/City, Eircode) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [userId, addressData.ADDRESS_LINE_1, addressData.ADDRESS_LINE_2, addressData.TOWN, addressData.COUNTY/CITY, addressData.EIRCOE], (err, result) => {
    if (err) throw err;
    console.log(`${tableName} address saved`);
  });
}

// Retrieve
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;

  const sql = `SELECT * FROM USER WHERE ID = ?`;
  db.query(sql, [userId], (err, userResult) => {
    if (err) throw err;

    const user = userResult[0];

    const addressesSql = `SELECT * FROM HOME_ADDRESS WHERE User_ID = ? OR
                          SELECT * FROM SHIPPING_ADDRESS WHERE User_ID = ?`;
    db.query(addressesSql, [userId, userId], (err, addressResults) => {
      if (err) throw err;

      const userWithAddresses = {
        user: user,
        addresses: addressResults
      };

      res.send(userWithAddresses);
    });
  });
});

// Update 
app.put('/user/:id', (req, res) => {
  const userId = req.params.id;
  const updatedUserData = req.body;

  const sql = 'UPDATE USER SET FNAME = ?, SNAME = ?, MOBILE = ?, EMAIL = ? WHERE ID = ?';
  db.query(sql, [updatedUserData.FNAME, updatedUserData.SNAME, updatedUserData.MOBILE, updatedUserData.EMAIL, userId], (err, result) => {
    if (err) throw err;

    // Update home address if provided
    if (updatedUserData.HOME_ADDRESS) {
      updateAddress(userId, updatedUserData.HOME_ADDRESS, 'HOME_ADDRESS');
    }

    // Update shipping address if provided
    if (updatedUserData.SHIPPING_ADDRESS) {
      updateAddress(userId, updatedUserData.SHIPPING_ADDRESS, 'SHIPPING_ADDRESS');
    }

    res.send('User updated');
  });
});

// Updating address
function updateAddress(userId, addressData, tableName) {
  const sql = `UPDATE ${tableName} SET ADDRESS_LINE_1 = ?, ADDRESS_LINE_2 = ?, TOWN = ?, COUNTY/CITY = ?, EIRCODE = ? WHERE User_ID = ?`;
  db.query(sql, [addressData.Address_Line_1, addressData.Address_Line_2, addressData.Town, addressData.County_City, addressData.Eircode, userId], (err, result) => {
    if (err) throw err;
    console.log(`${tableName} address updated`);
  });
}

// Delete 
app.delete('/user/:id', (req, res) => {
  const userId = req.params.id;

  const deleteSql = 'DELETE FROM USER WHERE ID = ?';
  db.query(deleteSql, [userId], (err, result) => {
    if (err) throw err;

    const deleteAddressSql = 'DELETE FROM HOME_ADDRESS WHERE User_ID = ? OR DELETE FROM SHIPPING_ADDRESS WHERE User_ID = ?';
    db.query(deleteAddressSql, [userId, userId], (err, result) => {
      if (err) throw err;
      console.log('User and associated addresses deleted');
    });

    res.send('User record deleted');
  });
});



