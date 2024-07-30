import express from "express";
const countryrouter = express.Router()
import * as country from "./country.controller.js";


countryrouter.route('/').get(country.getAllCountries)
countryrouter.route('/add').post(country.addcountry)
export {countryrouter}

// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Select Country</title>
// </head>
// <body>
//   <h1>Select Your Country</h1>
//   <select id="country-select"></select>
//   <button id="select-country-button">Select Country</button>

//   <script>
//     document.addEventListener('DOMContentLoaded', () => {
//       const countrySelect = document.getElementById('country-select');

//       fetch('/countries')
//         .then(response => response.json())
//         .then(countries => {
//           countries.forEach(country => {
//             const option = document.createElement('option');
//             option.value = country.code;
//             option.textContent = country.name;
//             countrySelect.appendChild(option);
//           });
//         });

//       document.getElementById('select-country-button').addEventListener('click', () => {
//         const selectedCountry = countrySelect.value;
//         fetch('/select-country', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ countryCode: selectedCountry })
//         })
//         .then(response => response.json())
//         .then(data => {
//           alert(data.message);
//         });
//       });
//     });
//   </script>
// </body>
// </html>
