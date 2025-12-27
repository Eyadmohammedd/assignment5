const express = require("express");
const mysql2 = require("mysql2");
const app = express();
app.use(express.json());
const port = 3000;
const db = mysql2.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "retail_store",
  multipleStatements: true 
});
db.connect((error) => {
  if (error) {
    console.log("Error connecting to database:", error);
  } else {
    console.log("Connected to database😘");

    // const createSuppliers = `
    //   CREATE TABLE IF NOT EXISTS Suppliers (
    //     SupplierID INT PRIMARY KEY AUTO_INCREMENT,
    //     SupplierName VARCHAR(255),
    //     ContactNumber VARCHAR(50)
    //   ) ENGINE=InnoDB;
    // `;

    // const createProducts = `
    //   CREATE TABLE IF NOT EXISTS Products (
    //     product_ID INT PRIMARY KEY AUTO_INCREMENT,
    //     product_name VARCHAR(255),
    //     price DECIMAL(10,2),
    //     StockQuantity INT,
    //     SupplierID INT,
    //     FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
    //   ) ENGINE=InnoDB;
    // `;

    // const createSales = `
    //   CREATE TABLE IF NOT EXISTS Sales (
    //     SaleID INT PRIMARY KEY AUTO_INCREMENT,
    //     product_ID INT,
    //     QuantitySold INT,
    //     sale_date DATE,
    //     SupplierID INT,
    //     FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
    //   ) ENGINE=InnoDB;
    // `;

//     db.execute(createSuppliers, (err) => {
//       if (err) console.error("Failed to create Suppliers table:", err.message);
//     });
//     db.execute(createProducts, (err) => {
//       if (err) console.error("Failed to create Products table:", err.message);
//     });
//     db.execute(createSales, (err) => {
//       if (err) console.error("Failed to create Sales table:", err.message);
//     });
//   }
// });

const addcolumn = `Alter TABLE products ADD COLUMN category VARCHAR(100)`;
db.execute(addcolumn, (err) => {
  if (err) console.error("Failed to add column:", err.message);
  else console.log("category added successfully");
});

const deletecolumn = `Alter TABLE products DROP COLUMN category`;
db.execute(deletecolumn, (err) => {
  if (err) console.error("Failed to delete column:", err.message);
  else console.log("category deleted successfully");
});

const updatecolumn = `Alter TABLE Suppliers MODIFY COLUMN ContactNumber VARCHAR(15)`;
db.execute(updatecolumn, (err) => {
  if (err) console.error("Failed to update column:", err.message);
  else console.log("ContactNumber updated successfully");
});

const updateproduct = `Alter TABLE Products MODIFY COLUMN product_name VARCHAR(255) NOT NULL`;
db.execute(updateproduct, (err) => {
  if (err) console.error("Failed to update column:", err.message);
  else console.log("product_name updated successfully");
});

app.post("/Products", (req, res, next) => {
  const { product_ID, product_name, price, StockQuantity, SupplierID } =
    req.body;

  const insertQuery = `INSERT INTO Products (product_name,price,StockQuantity,SupplierID) VALUES (?,?,?,?)`;
  db.execute(
    insertQuery,
    [product_name, price, StockQuantity, SupplierID],
    (error, result) => {
      if (error) {
        return res.status(500).json({
          message: "Failed to add new product",
          error: error.message,
        });
      } else {
        res.status(201).json({ message: "Done", result });
      }
    }
  );
});

app.post("/Suppliers", (req, res, next) => {
  const { SupplierID, SupplierName, ContactNumber } = req.body;

  const insertQuery =
    "INSERT INTO Suppliers (SupplierID,SupplierName,ContactNumber) VALUES (?,?,?)";
  db.execute(
    insertQuery,
    [SupplierID, SupplierName, ContactNumber],
    (error, result) => {
      if (error) {
        return res.status(500).json({
          message: "Failed to add new supplier",
          error: error.message,
        });
      } else {
        res.status(201).json({ message: "Done", result });
      }
    }
  );
});

const updatepriceColumn = `UPDATE Products SET price = 25.00 WHERE product_ID = 2`;
db.execute(updatepriceColumn, (err) => {
  if (err) console.error("Failed to update price column:", err.message);
  else console.log("price column updated successfully");
});

const deletepriceColumn = `DELETE FROM Products WHERE product_ID = 3`;
db.execute(deletepriceColumn, (err) => {
  if (err) console.error("Failed to delete price column:", err.message);
  else console.log("price column deleted successfully");
});
app.get("/sales/total-quantity", (req, res,next) => {
  const query = `
    SELECT product_ID, SUM(QuantitySold) AS total_quantity_sold
    FROM Sales
    GROUP BY product_ID;
  `;
  db.execute(query, (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});

app.get("/products/highest-stock", (req, res,next) => {
  const query = `
    SELECT * FROM Products
    ORDER BY StockQuantity DESC
    LIMIT 1;
  `;
  db.execute(query, (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result[0]);
  });
});
app.get("/suppliers/start-F", (req, res,next) => {
  const query = `
    SELECT * FROM Suppliers
    WHERE SupplierName LIKE 'F%';
  `;
  db.execute(query, (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});
app.get("/products/never-sold", (req, res,next) => {
  const query = `
    SELECT p.*
    FROM Products p
    LEFT JOIN Sales s ON p.product_ID = s.product_ID
    WHERE s.product_ID IS NULL;
  `;
  db.execute(query, (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});
app.get("/sales/details", (req, res,next) => {
  const query = `
    SELECT s.SaleID, p.product_name, s.sale_date, s.QuantitySold
    FROM Sales s
    JOIN Products p ON s.product_ID = p.product_ID;
  `;
  db.execute(query, (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json(result);
  });
});
// app.get("/create-user", (req, res,next) => {
//    const createUser = `CREATE USER IF NOT EXISTS 'store_manager'@'localhost' IDENTIFIED BY 'password123'`;
//   const grantPermissions = `GRANT SELECT, INSERT, UPDATE ON retail_store.* TO 'store_manager'@'localhost'`;
//   db.execute(createUser, (err) => {
//     if (err) return res.json({ error: err.message });

//     db.execute(grantPermissions, (err2) => {
//       if (err2) return res.json({ error: err2.message });
//       res.json({ message: "User created and permissions granted" });;
//     });
//   });
// });
app.get("/revoke-update", (req, res) => {
  const query = `
    REVOKE UPDATE ON retail_store.* FROM 'store_manager'@'localhost';
  `;
  db.execute(query, (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "UPDATE permission revoked" });
  });
});
app.get("/grant-delete-sales", (req, res) => {
  const query = `
    GRANT DELETE ON retail_store.Sales TO 'store_manager'@'localhost';
  `;
  db.execute(query, (err) => {
    if (err) return res.json({ error: err.message });
    res.json({ message: "DELETE granted on Sales table" });
  });
});

app.listen(port, () => {
  console.log(`Server running at ${port}🚀🚀🚨`);
});
  }
});