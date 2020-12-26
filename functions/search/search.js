/* eslint-disable */
const fetch = require('node-fetch')
const cheerio = require('cheerio')
exports.handler = async function(event, context) {
  // console.log(event.queryStringParameters)
  const q = event.queryStringParameters.q || 'no search term'
  try {
    var links = await searchMe(q)
    return {
      statusCode: 200,
      body: JSON.stringify({ links })
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}



// fetch("https://www.google.com/search?q=be+brave&oq=be+brave&aqs=chrome..69i57j69i64l3.4592j0j9&sourceid=chrome&ie=UTF-8", {
//   "headers": {
//     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//     "accept-language": "en-US,en;q=0.9",
//     "sec-fetch-dest": "document",
//     "sec-fetch-mode": "navigate",
//     "sec-fetch-site": "none",
//     "sec-fetch-user": "?1",
//     "upgrade-insecure-requests": "1",
//     "x-client-data": "CJS2yQEIpbbJAQjEtskBCKmdygEI0qDKAQiZwsoBCKzHygEI9cfKAQj4x8oBCKTNygEI3NXKAQjtmMsBCJSaywEIi5zLAQjBnMsBGKibywE="
//   },
//   "referrerPolicy": "strict-origin-when-cross-origin",
//   "body": null,
//   "method": "GET",
//   "mode": "cors",
//   "credentials": "include"
// });




// search the top 20 google results
async function searchMe(query) {
  const profile = [
    {
      query: '#search a',
      heading: 'h3',
      UA: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0'
    },
    {
      query: '#main a',
      heading: '[role=heading]',
      UA: 'Mozilla/5.0 (MSIE; Windows 10)'
    }
  ][Number(Math.random() < 0.5)]
  console.log({profile})
  var response = await fetch('https://www.google.com/search?q=' + query, {
    headers: { 
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "x-client-data": "CJS2yQEIpbbJAQjEtskBCKmdygEI0qDKAQiZwsoBCKzHygEI9cfKAQj4x8oBCKTNygEI3NXKAQjtmMsBCJSaywEIi5zLAQjBnMsBGKibywE=",
      'user-agent': profile.UA
    }
  })
  if (!response.ok) {
    // NOT res.status >= 200 && res.status < 300
    return { statusCode: response.status, body: response.statusText }
  }
  var tmp = await response.text()
  var $ = cheerio.load(tmp)
  var links = []
  $(profile.query).each(function(i, link){
  // $('#main a').each(function(i, link){
    var big = cheerio.html($(link))
    var headingtext = cheerio.load(big)('[role=heading]').text()
    var h3text = cheerio.load(big)('h3').text()
    // var linktext = cheerio.load(big)(profile.heading).text() || $(link).text()
    var linktext = headingtext || h3text || $(link).text()
    linktext = linktext
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/\s+/g, " ").trim()
    var siblingtext = $($(link).parent().siblings()).text()
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/\s+/g, " ").trim()
    var href = $(link).attr('href')
    // console.log({linktext, siblingtext, href})
    if (!['', 'Cached', 'View on Twitter', 'Similar'].includes(linktext) && href !== '#' && !linktext.startsWith('Twitter · ')) {
      // console.log({big, linktext})
      links.push({linktext, siblingtext, href})
    }
  });

  // response = await fetch('https://www.google.com/search?start=10&q=' + query, {
  //   headers: { 
  //     'user-agent': 'Mozilla/5.0 (MSIE; Windows 10)'
  //   }
  // })
  // if (!response.ok) {
  //   // NOT res.status >= 200 && res.status < 300
  //   return { statusCode: response.status, body: response.statusText }
  // }
  // var tmp = await response.text()
  // var $ = cheerio.load(tmp)
  // $(profile.query).each(function(i, link){
  //   var linktext = $(link).text()
  //     .replace(/(\r\n|\n|\r)/gm, "")
  //     .replace(/\s+/g, " ").trim()
  //   var siblingtext = $($(link).parent().siblings()).text()
  //     .replace(/(\r\n|\n|\r)/gm, "")
  //     .replace(/\s+/g, " ").trim()
  //   var href = $(link).attr('href')
  //   links.push({linktext, siblingtext, href})
  // });
  return links
}