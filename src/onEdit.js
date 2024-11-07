

function onEdit(e) {
  Logger.log(JSON.stringify(e))
  if ((e.range.columnStart <= 2
    && e.range.columnEnd >= 2) // edit includes second column
    && e.range.getSheet().getSheetId() == '1664211028' // on feeds sheet
  ) { // edit range includes second column on feeds sheetp
    Logger.log('updating formulas for rows '
    + e.range.rowStart + '-' + e.range.rowEnd);

    const feedsFormulasCol = 3;
    
    let queries = e.range.offset(0, 2-e.range.columnStart,
      e.range.rowEnd - e.range.rowStart + 1).getValues();

    Logger.log(queries);
  
    let newFormulas = [];

    for (let row = e.range.rowStart;
     row <= e.range.rowEnd; row++) {
      
      let query = queries[row - e.range.rowStart][0];

      Logger.log('query:' + query);

      let rowFormu = query2f(query);
      
      if (query != '' && query != null)
        newFormulas.push([(rowFormu!='' ?
      '=IFNA(TRANSPOSE(FILTER(URL,'+rowFormu+')))' : '')]);
      else newFormulas.push(['']);
    }
    
    Logger.log(newFormulas);

    e.range.offset(0, feedsFormulasCol-e.range.columnStart, 
    newFormulas.length, 1)
    .setFormulas(newFormulas);
  }
  
}
