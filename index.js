#! /usr/bin/env node
 
var settings = require('user-settings').file('.calendar-cli')
var prompt = require('sync-prompt').prompt
var request = require('request')
var ical = require('ical')
var URL = require('url')

function cliCalendar () {

  var url = settings.get('url')
  
  if (!url || !valid(url)) {
    url = prompt('what is your ics url? ')
    settings.set('url', url)
  }

  var now = Date.now()
  var oneHour = 1000*60*60
  var oneDay = oneHour*24

  request(url, function (e, r, body) {

    var cal = ical.parseICS(body)
    var events = Object.keys(cal)
      .filter(function (key) {
        var event = cal[key]
        return event.summary && event.start > now-oneHour && event.start < now+oneDay
      })
      .map(function (key) {
        return cal[key]
      })

    events.sort(function (e1, e2) {
      return e1.start - e2.start
    })

    events.forEach(function (event) {
          console.log(event.summary)
          console.log('\t' + event.start.toLocaleTimeString() +' / '+ event.location)
          console.log('')
      })
  })


}

function valid(url) {
  var p = URL.parse(url)
  return p.protocol && p.host
}

cliCalendar()

module.exports = cliCalendar