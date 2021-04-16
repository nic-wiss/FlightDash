function buildTable(fileName, tableName) {
  $(document).ready(function () {

      // FETCHING DATA FROM JSON FILE
      $.getJSON(fileName,
              function (data) {
          var tableData = '';

          //GRABBING HEADER INFORMATION
          tableData += '<tr>';
          for(i = 0; i < data.length; i++) {
            tableData += '<td>' + data[i].id + '</td>';
          }
          tableData += '</tr>';

          // ITERATING THROUGH OBJECTS
          $.each(data, function (key, value) {

              //CONSTRUCTION OF ROWS HAVING
              // DATA FROM JSON OBJECT
              tableData += '<tr>';
              tableData += '<td>' +
                  value.Departure + '</td>';

              tableData += '<td>' +
                  value.Arrival + '</td>';

              tableData += '<td>' +
                  value.Price + '</td>';

              tableData += '</tr>';
          });

          //INSERTING ROWS INTO TABLE
          $(tableName).append(tableData);
      });
  });
}
