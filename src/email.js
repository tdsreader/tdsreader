

function composeEmail(item) {

      let url = item[cUrl];

      let title = item[cTitle];

        let description = item[cDescription];

        const countryCol = 1; // to user: you can specify the country notation here - from 1 to 4
        
        let countryInEmail = item[cCountry]
            .replace(/^- /,'')
            .split('\n- ')[countryCol - 1];

        let featured = item[cFeatured];
        
        let projectType = item[cType];

        let fixedPrice = item[cFixedPrice];

        let hourlyRateFrom = item[cHourlyRateFrom];

        let hourlyRate = item[cHourlyRate];

        let price_type;

        if (projectType == 'f') {
          if (fixedPrice != 'n/a') { 
            price_type = '$' + fixedPrice + 'f';
          } else {
            price_type = '-f';
          }
        } else {
          if (hourlyRateFrom != hourlyRate) {
            if (hourlyRate != 'n/a') {
              price_type = '$' + hourlyRateFrom
              + '-' + '$' + hourlyRate + 'h';
            } else {
              price_type = '-h';
            }
          } else {
            price_type = '$' + hourlyRate + 'h';
          }
        }

        let level;

        switch (item[cLevel]) {
          case 1:
            level = '$';
            break;
          case 2:
            level = '$$';
            break;
          case 3:
            level = '$$$';
            break;
          default:
            level = ''
        }

        /* if (item[cLevel] == 1) level = '$';
        if (item[cLevel] == 2) level = '$$';
        if (item[cLevel] == 3) level = '$$$';
        if (item[cLevel] == 'n/a') level = ''; */

        let skills = item[cSkills];

        let stars = starsFormatter.format(item[cStars])
        let reviews = item[cReviews];
        let stars_reviews = ( true ?
        '<br /><br />'
        + '⭐️ '
        + stars
        + ' / '
        + reviews : '' )

        let totalSpent = priceFormatter.format(item[cClientTotalSpent]);
        
        const subject = price_type
          + (item[cCountry] != 'n/a' ?
            ', ' + countryInEmail
          : '')
          + (level != '' ? ', ' + level : '')
          // + ' (' + countryInEmail + ')',
          // + ' '  + title
          // + ' ' + id
        
        let skills2 = '<ul>\n<li>'
          + skills.replace(/\n- /g,'</li>\n<li>')
          .replace(/^- /,'')
          + '</li>\n</ul>'


        let emailObj = {


          name: ssName,

          to: recipient,

          subject: ( featured ? '(FEATURED) ' : '' ) + subject,

          htmlBody: ''
          + '<b>'
          // + '<a href="' + url + '">'
          + title
          // + '</a>'
          + '</b>'
          + '<br /><br />'
  
          + '(<a href="' + url + '">'
          + url
          + '</a>)'
          + '<br /><br />'
    
          + description.replace(/\n/g,'<br />')
          + ( skills != '' ? '<br /><br /><b>Skills:</b><br />'
          // + '<br /><br />'
          + skills
          .replace(/^- /gm,'&bull; ')
          .replace(/\n/g,'<br />') : '')
          // + '<br /><br />'
          + stars_reviews
          + '<br /><br />' + totalSpent + ' total spent'

          + '<br /><br />'
          + '<a href="' + url + '">'
          + 'View on Upwork'
          + '</a>'

          + (silentmode ? '<br /><br /><small>silentmode</small>' : '')



        }

  return emailObj;
        
}






















































