  var version = 'v1'

  var cUrl

  var cTitle

  var cDescription

  var cSkills

  var cSent

  var cNotified

  var cCreated
      
  var cPublished

  var cCountry

  var cReviews
  
  var cStars

  var cLevel

  var cClientTotalSpent
  
  var cType

  var cFixedPrice

  var cHourlyRateFrom

  var cHourlyRate

  var cQuery

  var cFeatured

  var cIndex

  var priceFormatter

  var starsFormatter

  var recipient

  var quota

  var silentmodeNR

  var silentmode

  var query

  let ss

  let ssName




function checkTDS() {
  
  let runDate = new Date();

  Logger.log(runDate);

  ss = SpreadsheetApp.getActiveSpreadsheet();
  
  ss.getRangeByName('set!lastRun').setValue(runDate);

  let lock = LockService.getScriptLock();

  Logger.log('trying to get lock')

  let hasLock = lock.tryLock(30*1000);

  if (!hasLock) {
    Logger.log('already running. exiting');
    return 0;
  }

  let checkNR = ss.getRangeByName('set!check');

  let check = (/^y/i).test(checkNR.getValue());

  if (!check) {
    Logger.log('not checking, exiting');
    lock.releaseLock();
    return 0;
  }

  Logger.log('start')

  let lastDataColumnLetter = 'T';

  let numberOfRows = 50;
  let numberOfColumns = letterToColumn(lastDataColumnLetter);

  let sendNR = ss.getRangeByName('set!send');
  
  let send = (/^y/i).test(sendNR.getValue());

  Logger.log('send:'+send)

  let reallySend = true;
  
  Logger.log('reallySend:' + reallySend)

  ssName = ss.getName()

  silentmodeNR = ss.getRangeByName('set!notifications');

  quota = MailApp.getRemainingDailyQuota();

  ss.getRangeByName('set!emailsLeftPerDay').setValue(quota);
  
  recipient = ss.getRangeByName('set!recipients').getValue();

  let dataSheet = ss.getSheetByName('database');

  let combinedSheet = ss.getSheetByName('combined');
  let combinedSheetCell = combinedSheet.getRange('A2');
  let combinedSheetRange = combinedSheet.getRange(2,1,numberOfRows,numberOfColumns);

  let allJobsSheet = ss.getSheetByName('all');

  let queryRange = ss.getRangeByName('combinedQuery');
  let oldQuery;

  let locale = ss.getSpreadsheetLocale();

  let cache = CacheService.getScriptCache();

  let oldids2 = cache.get('oldids');
  
  if (oldids2 != null)
    oldids2 = oldids2.split(',');
  else oldids2 = [];
  
  Logger.log('oldids from cache .length: ' + oldids2.length);
  Logger.log(oldids2.slice(0,7));

  let allJobsRange = allJobsSheet.getRange(2,1,numberOfRows,numberOfColumns); // a range to put the all jobs into

  let countriesSheet = ss.getSheetByName('countries');
  let countriesData = countriesSheet.getDataRange().getValues();
  let countriesArray = countriesData[0].map((_, colIndex) => countriesData.map(row => row[colIndex]));
  let countriesSheetCombinedIndex = countriesData[0].indexOf('Combined');


  let headers = allJobsSheet.getRange(1,1,1,numberOfColumns).getValues()[0]; // reading header values into an array
  Logger.log(headers);

  cUrl = headers.indexOf('URL');

  cTitle = headers.indexOf('Title');

  cDescription = headers.indexOf('Description');

  cSkills = headers.indexOf('Skills');

  cSent = headers.indexOf('Sent');
  
  cNotified = headers.indexOf('Notified');

  cCreated = headers.indexOf('Created');
      
  cPublished = headers.indexOf('Published');

  cCountry = headers.indexOf('Country');

  cReviews = headers.indexOf('Reviews');
  
  cStars = headers.indexOf('Stars');

  cLevel = headers.indexOf('Level');

  cClientTotalSpent = headers.indexOf('TotalSpent');
  
  cType = headers.indexOf('JobType');

  cFixedPrice = headers.indexOf('FixedPrice');

  cHourlyRateFrom = headers.indexOf('HourlyRateFrom');

  cHourlyRate = headers.indexOf('HourlyRate');
  
  cQuery = headers.indexOf('Query');

  cFeatured = headers.indexOf('Featured');
  
  cIndex = headers.indexOf('Index');

  let lastSentNR = ss.getRangeByName('lastSent');

  let lastNotifiedNR = ss.getRangeByName('lastNotified');

  let runDate_getTime = runDate.getTime();

  priceFormatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    trailingZeroDisplay: 'stripIfInteger'
  });

  starsFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2
  });

  let jobsOld;

  let waitBetweenRunsMs = 4300;




  for (let r = 0; ; r++) {

    let looprunDate = new Date();

    Logger.log('r' + r);

    check = (/^y/i).test(checkNR.getValue());

    if (!check) {
      // if check value doesn't start with 'y'
      Logger.log('stop checking, exiting');
      lock.releaseLock();
      return 0;
    }

    Logger.log(looprunDate);

    // checking if it's running for too long

    let curDate = new Date();

    let runningTimeMs = curDate.getTime() - runDate_getTime

    if (runningTimeMs > 287*1000) {
      Logger.log('Running for ' + runningTimeMs/1000 + ' s - exiting.')
      lock.releaseLock();
      return 0;
    }

    // start

    console.time('looprun');

    let allJobsData = [];

    let data = datalib.getData();

    let jobs = data.jobs; // reading the jobs
    
    if (jobs == null || jobs[0].id == null) {
      
      Logger.log("the feed is empty");

      Logger.log('waiting for ' + waitBetweenRunsMs/1000 + ' seconds');
      Utilities.sleep(waitBetweenRunsMs); // waiting

      continue;
    }



    if (r > 0) {

      let jobsids = [];
      let jobsOldIds = [];

      let arraysAreSame = true;

      for (let jj = 0; jj < jobs.length; jj++) {
        jobsids.push(jobs[jj].id);
        jobsOldIds.push(jobsOld[jj].id);
        if (jobs[jj].id != jobsOld[jj].id) {
          arraysAreSame = false;
          break;
        }
      }

      if (arraysAreSame) { // if the job feed hasn't changed since previous run
        
        Logger.log("the feed is the same");

        Logger.log('waiting for ' + waitBetweenRunsMs/1000 + ' seconds');
        Utilities.sleep(waitBetweenRunsMs); // waiting

        continue;

      } else { // the feed is different
        Logger.log('feed jobsids: ' + jobsids);
        Logger.log('feed jobsOldIds: ' + jobsOldIds);
      }

    }

    query = queryRange.getValue();

    // from object to spreadsheet

    for (let jj = 0; jj < jobs.length; jj++) { // loop over all jobs to create an array to setValues to the all sheet

      let job = jobs[jj]; // job Object


      let allJobsRow = [];

      if (cUrl > -1) allJobsRow[cUrl] = job.url;

      if (cTitle > -1) allJobsRow[cTitle] = job.title;

      if (cDescription > -1) allJobsRow[cDescription] = job.description;

      if (cSkills > -1) allJobsRow[cSkills] = job.skills;

      if (cCreated > -1) allJobsRow[cCreated] = new Date(job.created)

      if (cPublished > -1) allJobsRow[cPublished] = new Date(job.published);
      
      let countryIndex = countriesArray[1].indexOf(job.country);

      if (cCountry > -1) allJobsRow[cCountry] = (countryIndex > 0 ? countriesArray[countriesSheetCombinedIndex][countryIndex] : job.country);  // takes two-letter code and gets the combined country label

      if (cReviews > -1) allJobsRow[cReviews] = job.totalReviews;

      if (cStars > -1) allJobsRow[cStars] = job.totalFeedback;

      if (cLevel > -1) allJobsRow[cLevel] = job.level;
      
      if (cType > -1) allJobsRow[cType] = job.type;

      if (cFixedPrice > -1) allJobsRow[cFixedPrice] = job.fixedPrice;
     
      if (cHourlyRate > -1) allJobsRow[cHourlyRate] = job.hourlyPriceTo;
      
      if (cHourlyRateFrom > -1) allJobsRow[cHourlyRateFrom] = job.hourlyPriceFrom;

      if (cClientTotalSpent > -1) allJobsRow[cClientTotalSpent] = job.clientTotalSpent;
      
      if (cQuery > -1) allJobsRow[cQuery] = query;
      
      if (cFeatured > -1) allJobsRow[cFeatured] = job.featured;
      
      if (cIndex > -1) allJobsRow[cIndex] = jj + 1;

      if (allJobsRow[numberOfColumns - 1] == null) allJobsRow[numberOfColumns  - 1] = ''; // filling the last column

      allJobsData.push(allJobsRow);

    }

    allJobsRange.setValues(allJobsData);

    if (query != oldQuery) {

      Logger.log('updating the combined formula')

      let formula = query2f(query, locale);

      combinedSheetCell.setFormula('=IFNA(FILTER(AllJobs,'
      + formula + '))');
      
    }

    
    // flushing the spreadsheet
    SpreadsheetApp.flush(); // 200 ms

    
    let items = combinedSheetRange.getValues(); // read the combined sheet back after flushing // 20 ms

    Logger.log('oldids.length: ' + oldids2.length);
    Logger.log(oldids2.slice(0,7));





    let newids = [];

    let newItems = [];
    
    for (let i = 0; i < items.length; i++) { // loop over input items
      
      let item = items[i];

      let url = item[cUrl];

      let title = item[cTitle];

      if (url == '' || /^#/.test(url) || title == '') continue;
      
      let id = url;
      
      let oldidsIndexOfId = oldids2.indexOf(id);

      let isnewjob = oldidsIndexOfId == -1;

      if (isnewjob) {

        Logger.log('new job: ' + url + '\n' + title);

        send = (/^y/i).test(sendNR.getValue());

        if (send) {
        
          silentmode = !(/^y/i).test(silentmodeNR.getValue());

          let emailObj = composeEmail(item);

          if (version == data.latestVersion) {
            data.footer = 
            data.footer
            .replace(/(<br \/>)+.*?NEW VERSION AVAILABLE.*/gi,'');
          }

          emailObj.htmlBody += data.footer;
          
          emailObj.htmlBody += ''
            // '<br /><br />' + quota + ' emails left per day'
            + '<br /><br /><a href="'
            + ss.getUrl()
            +'">' + ss.getName() + '</a>'

          let sentDate = new Date();

          Logger.log('sending: ' + (sentDate.getTime() - looprunDate.getTime()) + 'ms delay from looprun start')

          if (reallySend) MailApp.sendEmail(emailObj);

          item[cSent] = sentDate;

          lastSentNR.setValue(sentDate);
          
          if (!silentmode) {
            lastNotifiedNR.setValue(sentDate);
            item[cNotified] = true;
          } else {
            item[cNotified] = false;
          }

          if (reallySend
           && quota < 30 && quota >= 20
           && cache.get('quota1') != 'yes') {
            MailApp.sendEmail(recipient, "Too many emails",
            "You are receiving too many emails and will soon run out of email quota of 100 emails per day. Please make your feeds more strict: "
            + ss.getUrl());
            cache.put('quota1', 'yes', 21600);
          }

          if (newItems.length > 8) {
            MailApp.sendEmail(recipient,
            'Too many new jobs',
            'There are too many jobs that satisfy your search queries and you may soon run out of email quota. Please check your search queries: '
            + ss.getUrl()
            + '\n\nand then enable the <b>send email</b> setting. Until you do this all new jobs will only be available in the spreadsheet database (not your email)');
            ss.getRangeByName('set!send').setValue('no')
            return 0;
          }

        }

        newids.push(id);

        newItems.push(item);
      
      } // end if isnewjob

    } // end of loop over input items

    // oldids.unshift(...newids);
    
    console.time('unshift')
    oldids2.unshift(...newids);
    console.timeEnd('unshift')
    
    console.time('slice')
    oldids2 = oldids2.slice(0,200);
    console.timeEnd('slice')

    console.time('cache.put')
    cache.put('oldids', oldids2 + '', 21600);
    console.timeEnd('cache.put')
  

    Logger.log('newItems: ' + newItems.length)

    
    // adding new items to the ss
    
    if (newItems.length > 0) {

      console.time('dataSheet.insertRows.setValues')

      dataSheet.insertRowsBefore(2, newItems.length);

      dataSheet.getRange(2,1, newItems.length, newItems[0].length).setValues(newItems).setBackground(null).setFontWeight(null); // .setFontColor(null)

      console.timeEnd('dataSheet.insertRows.setValues')
      
    }

    console.timeEnd('looprun') // 700 ms if no new items

    oldQuery = query;

    jobsOld = jobs;

    Logger.log('waiting for '+waitBetweenRunsMs/1000+' seconds')    
    Utilities.sleep(waitBetweenRunsMs); // wait  between loop runs

  }

}













