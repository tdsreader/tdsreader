

function test_query2f() {

  const query = '"test query "';

  const locale = 'en_US';

  query2f(query, locale);

}





  // converts search query to google sheets formula

function query2f(query, locale) {

  Logger.log('query2f converting query to formula');

  if (query == null) throw 'no query'

  Logger.log(query);

  if (locale == null) locale = SpreadsheetApp
  .getActiveSpreadsheet()
  .getSpreadsheetLocale();

  /// Logger.log(locale);

  const sep = separators[locale];

  /// Logger.log(sep);
  
  // replacing multi-whitespace

  query = query.replaceAll(/\s+/g,' ');
  
  query = query.trim();



  const keywords = [
    {
      regex: 'title',
      nr   : 'Title',
      letter: 't'
    },
    { 
      regex: 'desc(?:ription)?',
      nr   : 'Description',
      letter: 'd'
    },
    {
      regex: 'skil+s?',
      nr   : 'Skills',
      letter: 's'
    }
  ]


  // tds
  {

    const re = new RegExp(
      '(?<!-)\\b' 
      + '([tds]+)'
      + '\\s*[=:]\\s*(\\*)?"\\s*(.+?(?<!(?<!\\\\)\\\\))\\s*"(\\*)?', 'gi');

    const matches = [...query.matchAll(re)];

    
    for (let m = 0; m < matches.length; m++) {
      
      const match = matches[m];

      const tds_match = match[1];

      let arr = [];

      for (let k = 0; k < keywords.length; k++) {

        const keyword = keywords[k];

        const kwre = new RegExp(keyword.letter, 'i');

        if (kwre.test(tds_match)) {
          const formula = '(REGEXMATCH('
            + keyword.nr
            + sep
            + '"(?i)'+(match[2]!=null?match[2]:'')
            +'\\b\\Q'+ match[3]
            +'\\E\\b'+(match[4]!=null?match[4]:'')
            +'"))';
          arr.push(formula);
        }
      }
      
      let formula;

      Logger.log(arr)
      
      if (arr.length <= 1) formula = arr[0];
      else formula = '(' + arr.join(' OR ') + ')';

      query = query.replaceAll(match[0], formula);

    }
  
  }

  // tdsr

  {

    const re = new RegExp('(?<!-)\\b' 
      + '([tds]+)r'
      + '\\s*[=:]\\s*(\\*)?"(.+?(?<!(?<!\\\\)\\\\))"(\\*)?', 'gi');

    const matches = [...query.matchAll(re)];

    for (let m = 0; m < matches.length; m++) {
      
      const match = matches[m];

      const tds_match = match[1];

      let arr = [];

      for (let k = 0; k < keywords.length; k++) {

        const keyword = keywords[k];

        const kwre = new RegExp(keyword.letter, 'i');

        if (kwre.test(tds_match)) {
          const formula = '(REGEXMATCH('
            + keyword.nr
            + sep
            + '"(?i)' + match[3] + '"))';

          arr.push(formula);
        }
      }

      let formula = '(' + arr.join(' OR ') + ')';

      query = query.replaceAll(match[0], formula);

    }
  
  }




  // keyword:"text"

  for (let k = 0; k < keywords.length; k++) {
    const keyword = keywords[k];
    const formula = '(REGEXMATCH('
      + keyword.nr
      + sep + ( keyword.nr == 'Skills' ?
        '"(?mi)^- \\Q$2\\E$"))'
      : '"(?i)$1\\b\\Q$2\\E\\b$3"))' )
     
    const regex = new RegExp('(?<!-)\\b'
      + keyword.regex
      + '\\s*[=:]\\s*(\\*)?"\\s*(.+?(?<!(?<!\\\\)\\\\))\\s*"(\\*)?', 'gi');
    
    query = query.replaceAll(regex, formula);
  
  }



  // country:
  {
    const keyword = {
      regex: 'country',
      nr: 'Country'
    };
    const formula = '(REGEXMATCH('
      + keyword.nr
      + sep + '"(?mi)^- ($2)$"))';
    const re3 = new RegExp( '(?<!-)\\b'
      + keyword.regex
      + '\\s*[:=]\\s*(\\*)?"\\s*(.+?(?<!(?<!\\\\)\\\\))\\s*"(\\*)?', 'gi');
    query = query
      .replaceAll(re3, formula);
  }


  // type
  {
    const keyword = {
      regex: '(?:project-?|job-?)?type',
      nr : 'JobType'
    };
    const formula = '('
      + keyword.nr
      + '=' + '"$2")';
    const re3 = new RegExp(  '(?<!-)\\b'
      + keyword.regex
      + '\\s*[:=]\\s*(\\*)?"?\\s*(f(?:ixed(?:-price)?)?|h(?:ourly)?)\\s*"?(\\*)?', 'gi');
    query = query
      .replaceAll(re3, formula);
  }


  // numerical values
  
  const num_kws = [
    {
      title: 'Stars',
      regex: 'stars'
    },
    {
      title: 'Reviews',
      regex: 'reviews'
    },
    {
      title: 'TotalSpent',
      regex: '(?:total-?)?spent'
    },
    {
      title: 'Level',
      regex: '(?:e-?(?:xp-?(?:erience-?)?)?(?:l(?:evel)?)?|l(?:evel)?)'
    },
    {
      title: 'FixedPrice',
      regex: '(?:f-?(?:ixed-?)?(?:p(?:rice)?)?|p(?:rice)?)'
    },
    {
      title: 'HourlyRate',
      regex: '(?:h-?(?:ourly-?)?(?:r(?:ate)?)?|rate)',
      titleMin: 'HourlyRateFrom'
    },
    {
      title: 'Featured',
      regex: 'featured'
    }
  ];

  for (let k = 0; k < num_kws.length; k++) {

    const keyword = num_kws[k];
    
    /* const re1 = new RegExp(kw.regex
    + '\\s*(<|<=|=|>|>=|<>)\\s*([0-9.,+-]+)', 'gi');
    const f1 = '(' + kw.title + '$1$2' + ')';
    
    const re2 = new RegExp(
      '([0-9.,+-]+)\\s*(<|<=|=|>|>=|<>)\\s*' + kw.regex, 'gi');
    const f2 = '(' + '$1$2' + kw.title + ')'; */
    
    const re = new RegExp(
      '(?:\\$?\\s*(\\S+)\\s*(<=|<>|>=|=|<|>)\\s*)?\\b'
      + keyword.regex
      + '\\b(?:\\s*(<=|<>|>=|=|<|>)\\s*\\$?\\s*(\\S+))?', 'gi');

    const matches = [...query.matchAll(re)];
    // Logger.log(matches);
    
    for (let m = 0; m < matches.length; m++) {
      
      const match = matches[m];

      if ( match[1] != null
        && match[2] != null
        && match[3] == null
        && match[4] == null ) 
        query = query.replaceAll(match[0],
         '(' + match[1] + match[2] + keyword.title + ')');

      if ( match[1] == null
        && match[2] == null
        && match[3] != null
        && match[4] != null ) 
        query = query.replaceAll(match[0],
         '(' + keyword.title + match[3] + match[4] + ')'); 

      if ( match[1] != null
        && match[2] != null
        && match[3] != null
        && match[4] != null ) {

        const f3 = '(('
        + match[1]
        + match[2]
        + keyword.title
        + ') AND ('
        + keyword.title
        + match[3]
        + match[4]
        + '))';

        query = query.replaceAll(match[0], f3);

      }

    }

  }



  // query = query.replaceAll(/(?<!\()\bfeatured\b(?!\))/gi,'(Featured)');

  

  // keyword-regex:"expression"

  for (let k = 0; k < keywords.length; k++) {

    const keyword = keywords[k];
    
    const formula = '(REGEXMATCH('
      + keyword.nr
      + sep + '"(?i)$2"))';

    const re = new RegExp(
      '(?<!-)\\b'
      + keyword.regex
      + '-?r(?:e(?:gex)?)?\\s*[=:]\\s*(\\*)?"(.+?(?<!(?<!\\\\)\\\\))"(\\*)?', 'gi');
    
    query = query.replaceAll(re, formula);

  }


  // regex:"expression"

  {
    let formulas = [];
    for (let k = 0; k < keywords.length; k++) {
      const kw = keywords[k];
      formulas.push('(REGEXMATCH('
        + kw.nr
        + sep + '"(?i)$2"))')
    }
    const formula = '(' + formulas.join(' OR ') + ')';

    const re = new RegExp('(?<!-)\\b'
      + 'r(?:e(?:gex)?)?\\s*[=:]\\s*(\\*)?"(.+?(?<!(?<!\\\\)\\\\))"(\\*)?', 'gi');

    query = query.replaceAll(re, formula)

  }
  

  { // "text" - without a prefix
    let formulas = [];
    for (let k = 0; k < keywords.length; k++) {
      const kw = keywords[k];
      formulas.push('(REGEXMATCH('
      + kw.nr
      + sep + '"(?i)$1\\b\\Q$2\\E\\b$3"))'); // skills are full phrase but not full skill
    }
    const formula = '(' + formulas.join(' OR ') + ')';

    const re3 = new RegExp('(?<![:;,=<>]\\s*)(\\*)?"\\s*(?!\\))(.+?(?<!(?<!\\\\)\\\\))\\s*"(\\*)?', 'gi');

    query = query
    .replaceAll(re3, formula)

  }

  query = query
  .replaceAll(/\bHourlyRate\s*</g, 'HourlyRateFrom<')
  .replaceAll(/(>=?)\s*HourlyRate\b/g, '$1HourlyRateFrom')
  
  query = query
  .replaceAll(/(?<!\\)\\"/g,'""')
  .replaceAll(/(?<!\\)\\\)/g,')')
  .replaceAll(/[*]\\b|\\b[*]/g,'')
  .replaceAll(/ OR /g,'+')
  .replaceAll(/ AND /g,'*')
  .replaceAll(/\) ?\(/g,')*(')
  .replaceAll(/\) +NOT\(/g,')*NOT(');
  
  Logger.log(query);

  

  return query;

}


















