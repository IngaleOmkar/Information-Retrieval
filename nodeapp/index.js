 const SolrNode = require('solr-node');

var client = new SolrNode({
  host: '127.0.0.1',
  port: '8983',
  core: 'data',
  protocol: 'http'
});

const fs = require('fs');
const csv = require('csv-parser');

const results = [];

// //To add data
// fs.createReadStream('data.csv')
//   .pipe(csv())
//   .on('data', (data) => {
//     // Assuming 'data' represents a person object from the CSV
//     // Update each person using client.update()
//     client.update(data, function(err, result) {
//       if (err) {
//         console.log(err);
//         return;
//       }
//       console.log('Response:', result.responseHeader);
//     });
//   })
//   .on('end', () => {
//     console.log('CSV file successfully processed');
//   });

//-------------------------------------------------------------------------------------------

// Delete
// const stringQuery = 'id:2';    // delete document with id 2
// const deleteAllQuery = '*';    // delete all
// const objectQUery = {id: 'd7497504-22d9-4a22-9635-88dd437712ff'};   // Object query
//  client.delete(deleteAllQuery, function(err, result) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log('Response:', result.responseHeader);
// });

//-------------------------------------------------------------------------------------------

//Normal query

// const titleQuery = {
//   title: 'Anticipated' 
// };

// // Build a search query var
// const searchQuery = client.query()
//   .q(titleQuery) //titleQuery should be a user input
//   .addParams({
//     wt: 'csv',
//     indent: true
//   })
//   // .start(1) //page to start
//    .rows(10) //results to display

// client.search(searchQuery, function (err, result) {
//   if (err) {
//     console.log(err);
//     return;
//   }

//   const response = result.response;
//   console.log(response);

//   if (response && response.docs) {
//     response.docs.forEach((doc) => {
//       console.log(doc);
//     })
//   }
// });

//-------------------------------------------------------------------------------------------

//Timeline search 

// Define your timeline search query parameters // YYYY-MM-DD needed but now is DD-MM-YYYY
const startTimestamp = new Date('0005-02-22T00:00:00Z').toISOString(); //error validation enddate cannot be "smaller" than startdate
const endTimestamp = new Date('0005-02-22T00:00:00Z').toISOString();
const query = 'created: ';
const filterQuery = `created:[${startTimestamp} TO ${endTimestamp}]`;

// Perform the timeline search
client.search(query, {
  fq: filterQuery,
}, function(err, result) {
  if (err) {
    console.log('Error:', err);
    return;
  }
  
  // Process the search results
  console.log('Search Results:', result.response);
});