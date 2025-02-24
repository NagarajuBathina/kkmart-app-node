const express = require("express");
const connectTodb = require("../misc/db");
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "62.72.28.52", // e.g., 'localhost'
  user: "u276789778_kk_mart", // e.g., 'root'
  password: "kkmart@123@Apple",
  database: "u276789778_kk_mart",
});

const searchFunction = async (req, res) => {
  //   const { name } = req.body;
  //   try {
  //     const query = "SELECT * FROM dummy WHERE name LIKE ?";
  //     const results = await new Promise((resolve, reject) => {
  //       connection.query(query, [`%${name}%`], (error, results) => {
  //         if (error) {
  //           return reject(error);
  //         }
  //         resolve(results);
  //       });
  //     });
  //     if (results.length === 0) {
  //       return res.status(404).json({ message: "No results found" });
  //     }
  //     return res.status(200).json({ results });
  //   } catch (e) {
  //     return res.status(500).json({ error: e.message });
  //   }
};

module.exports = { searchFunction };
