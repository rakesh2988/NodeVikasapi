const con = require('../../../config/database');
const response = require('../../../utils/response');
const moment = require('moment');
const _ = require('lodash');


module.exports.searchEvent = (req, res) => {

  console.log("==== print search event ====>>>=== event event event ===",req.body);

  // variable type 1 = today, 2 = tomorrow, 3 = this week, 4 = next week, 5 = this month, 6 = next month, 7 = for start date and end date list

  var count_query;
  var value1 = [];
  var value2 = [];
  var payload, query, count_query;
  var search_dates = [];
  var today_date;
  var i = 0, j = 0;
  // Pagination part
var limit = req.body.limit || 6;
var page = req.body.page;
var offset = (page || 1) * limit -  limit;

  if (req.body.type == "") {
    delete req.body.type
  }
  if (req.body.city == "") {
    delete req.body.city
  }
  if (req.body.search_text == "") {
    delete req.body.search_text
  }
  if (req.body.category == "") {
    delete req.body.category
  }
  if(req.body.start_date == ""){
    delete req.body.start_date
  }
  if(req.body.end_date == ""){
    delete req.body.end_date
  }
  var params = [];
  for (let i = 0; i < Object.keys(req.body).length; i++) {
    if (Object.keys(req.body)[i] == 'type') {
      params.push({ type: Object.values(req.body)[i] })
    }
    if (Object.keys(req.body)[i] == 'city') {
      params.push({ city: Object.values(req.body)[i] })
    }
    if (Object.keys(req.body)[i] == 'search_text') {
      console.log("==== print logs of event name========",Object.keys(req.body)[i]);
      params.push({ search_text: Object.values(req.body)[i]})
    }
    if (Object.keys(req.body)[i] == 'category') {
      params.push({ category: Object.values(req.body)[i] })
    }
  }

  console.log("==========print params ===============", params);

  if (params.length > 0) {
    query = `SELECT * FROM ev_to_add_event WHERE`
    count_query = `SELECT COUNT(*) as total_event FROM ev_to_add_event WHERE`

    params.forEach((item) => {
      Object.keys(item).forEach((key, index) => {
        if (i == 0) {
          if (key == "type") {
            var payload = dateList(item[key]);
            query += ` start_date  IN(${payload})`
            count_query += ` start_date  IN(${payload})`
          }
          if (key == "search_text") {
            query += ` event_name= ?`
            count_query += ` event_name= ?`
          }
          if (key == "city") {
            query += ` city= ?`
            count_query += ` city= ?`
          }
          if (key == "category") {
            query += ` event_category = ?`
            count_query += ` event_category = ?`
          }
        } else {
          if (key == "type") {
            var payload = dateList(item[key]);
            query += ` AND start_date  IN(${payload})`
            count_query += ` AND start_date  IN(${payload})`
          }
          if (key == "search_text") {
            query += ` AND event_name= ?`
            count_query += ` AND event_name= ?`
          }
          if (key == "city") {
            query += ` AND city= ?`
            count_query += ` AND city=?`
          }
          if (key == "category") {
            query += ` AND event_category = ?`
            count_query += ` AND event_category = ?`
          }
        }
      })
      i++;
    })
  } else {
    query = '',
      query = `SELECT * FROM ev_to_add_event WHERE start_date >= ?`,
      count_query = '',
      count_query = `SELECT COUNT(*) as total_event FROM ev_to_add_event WHERE start_date >= ?`
  }

  function dateList(type) {
    if (type == "1") {  //search for today
      today_date = new Date();
      search_dates.push(JSON.stringify(today_date).toString().split('T')[0].split('"')[1]);
      payload = '"' + search_dates.join('","') + '"';
      return payload;
    }

    if (type == "2") { // search for tomorrow
      today_date = new Date();
      var tomorrow = new Date(today_date.setDate(today_date.getDate() + 1));
      search_dates.push(JSON.stringify(tomorrow).toString().split('T')[0].split('"')[1]);
      payload = '"' + search_dates.join('","') + '"';
      return payload;
    }

    if (type == "3") { // search for this week
      var current_date_week = new Date();
      var index_current_date_week = current_date_week.getDay();
      var listdayofWeek = [];
      listdayofWeek.push(new Date(current_date_week.setDate(current_date_week.getDate() + 0)));
      function dateOfWeek() {
        if (index_current_date_week < 6) {
          listdayofWeek.push(new Date(current_date_week.setDate(current_date_week.getDate() + 1)));
          index_current_date_week++;
          dateOfWeek();
        }
      }
      dateOfWeek();
      for (let i = 0; i < listdayofWeek.length; i++) {
        search_dates.push(JSON.stringify(listdayofWeek[i]).toString().split('T')[0].split('"')[1]);
      }
      payload = '"' + search_dates.join('","') + '"';
      return payload;
    }

    if (type == "4") { //search for next week
      today_date = new Date();
      var listdayofNextWeek = [];
      var last_day_current_week = new Date(today_date.setDate(today_date.getDate() - today_date.getDay() + 6));
      var index_date_next_week = 0;
      function dateOfNextWeek() {
        if (index_date_next_week <= 6) {
          listdayofNextWeek.push(new Date(last_day_current_week.setDate(last_day_current_week.getDate() + 1)));
          index_date_next_week++;
          dateOfNextWeek();
        }
      }
      dateOfNextWeek();
      for (let i = 0; i < listdayofNextWeek.length; i++) {
        search_dates.push(JSON.stringify(listdayofNextWeek[i]).toString().split('T')[0].split('"')[1]);
      }
      payload = '"' + search_dates.join('","') + '"';
      return payload;
    }

    if (type == "5") {  // search for this month
      var date = new Date();
      var lastDayMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      var listdayofmonth = [];
      listdayofmonth.push(new Date());
      var today = new Date();
      function dateOfMonth() {
        var comp_today = today;
        var comp_last = lastDayMonth;
        if (JSON.stringify(comp_today).split('T')[0].split('"')[1] < JSON.stringify(comp_last).split('T')[0].split('"')[1]) {
          listdayofmonth.push(new Date(today.setDate(today.getDate() + 1)));
          dateOfMonth();
        }
      }
      dateOfMonth();
      for (let i = 0; i < listdayofmonth.length; i++) {
        search_dates.push(JSON.stringify(listdayofmonth[i]).toString().split('T')[0].split('"')[1]);
      }
      payload = '"' + search_dates.join('","') + '"';
      return payload;
    }

    if (type == "6") { //search for next month
      today_date = new Date();
      var next_month_day_list = [];
      var next_month_first_day = new Date(today_date.getFullYear(), today_date.getMonth() + 1, 2);
      var next_month_day = new Date(today_date.getFullYear(), today_date.getMonth() + 1, 2);
      next_month_day_list.push(next_month_day);
      var next_month_last_day = new Date(today_date.getFullYear(), today_date.getMonth() + 2, 1);

      function dateOfNextMonth() {
        var comp_next_month_first_day = next_month_first_day;
        var comp_next_month_last_day = next_month_last_day;
        if (JSON.stringify(comp_next_month_first_day).split('T')[0].split('"')[1] < JSON.stringify(comp_next_month_last_day).split('T')[0].split('"')[1]) {
          next_month_day_list.push(new Date(comp_next_month_first_day.setDate(comp_next_month_first_day.getDate() + 1)));
          dateOfNextMonth();
        }
      }

      dateOfNextMonth();
      for (let i = 0; i < next_month_day_list.length; i++) {
        search_dates.push(JSON.stringify(next_month_day_list[i]).toString().split('T')[0].split('"')[1]);
      }
      payload = '"' + search_dates.join('","') + '"';
      return payload;
    }
    if(type == "7"){
      start_date = new Date(req.body.start_date);
      end_date = new Date(req.body.end_date);
      var list_start_end_date = [];
      function startEndDate() {
        if (start_date <= end_date) {
          list_start_end_date.push(new Date(start_date.setDate(start_date.getDate() + 1)));
          startEndDate();
        }
      }
      startEndDate();
      for (let i = 0; i < list_start_end_date.length; i++) {
        search_dates.push(JSON.stringify(list_start_end_date[i]).toString().split('T')[0].split('"')[1]);
      }
      payload = '"' + search_dates.join('","') + '"';

      console.log("=== print list of the dates of the month ===>>>===============", payload);
      return payload;
    }
  }


  con.connect(function (err) { 
    if (params.length > 0) {
      query += `AND start_date >= ? ORDER BY start_date ASC LIMIT ${limit} OFFSET  ${offset}`
      console.log("======= print complete query ===================",query);
      params.forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (key !== "type" && item[key] !== '') {
            value1.push(item[key])
            value2.push(item[key])
          }
        })
      })
      value1.push(moment(new Date()).format('YYYY-MM-DD'))
      value2.push(moment(new Date()).format('YYYY-MM-DD'))
      // console.log("=====value ===>>", value1);
    } else {
      query += ` ORDER BY start_date ASC LIMIT ${limit} OFFSET  ${offset}`
      value1 = [moment(new Date()).format('YYYY-MM-DD')];
      value2 = [moment(new Date()).format('YYYY-MM-DD')];
    }
    con.query(query, value1, (err, data) => {
      if (err) {
        response.internalError(500, "Error components:user:controller:userEventController:searchEvent", res);
      } else {
        countData(count_query, data);
      }
    })

    function countData(count_query, data) {
      con.query(count_query, value2, (err, total) => {
        // console.log("=====>>>>=======>>>>",err,total)
        if (err) {
          response.internalError(500, "Error in components:user:controller:userEventController:searchEvent", res);
        } else {
          return res.json({
            status: 200,
            message: 'Event list',
            events: data,
            limit: limit,
            size: Math.ceil(total/limit),
            total_event: total
          })
        }
      })
    }
  })
}

//Get list of events and upcoming events
module.exports.getEvents = (req, res) => {
  var payload, query;
  var search_dates = [];

  con.connect(function (err) {
    var eventsData = new Promise((resolve, reject) => {
      var event_query = `SELECT * FROM ev_to_add_event WHERE start_date >= ? ORDER BY start_date ASC `;
      con.query(event_query, [moment(new Date()).format('YYYY-MM-DD')], (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })

    var upcoming = (events) => {
      return new Promise((resolve, reject) => {
        var date = new Date();
        var lastDayMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        var listdayofmonth = [];
        listdayofmonth.push(new Date());
        var today = new Date();
        function dateOfMonth() {
          var comp_today = today;
          var comp_last = lastDayMonth;
          if (JSON.stringify(comp_today).split('T')[0].split('"')[1] < JSON.stringify(comp_last).split('T')[0].split('"')[1]) {
            listdayofmonth.push(new Date(today.setDate(today.getDate() + 1)));
            dateOfMonth();
          }
        }
        dateOfMonth();
        for (let i = 0; i < listdayofmonth.length; i++) {
          search_dates.push(JSON.stringify(listdayofmonth[i]).toString().split('T')[0].split('"')[1]);
        }
        payload = search_dates;
        query = `SELECT * FROM ev_to_add_event  WHERE start_date  IN  (${'"' + payload.join('","') + '"'})  ORDER BY start_date LIMIT 3`;

        con.query(query, (err, upcoming) => {
          if (err) {
            reject(err);
          } else {
            console.log("=== print upcoming  ==== event s ====>>> in get events function ===>>>", events, events.length);
            if(events.length > 3){
              upcoming = upcoming.splice(0, 1);
              upcoming = upcoming.splice(1, 1)
            }else{
              upcoming = events;
            }
           
            var data = {
              events: events,
              upcoming: upcoming
            }
            resolve(data);
          }

        })

      })

    }

    var searchPayload = (newData) => {
      return new Promise((resolve, reject) => {
        let query = `SELECT city,state,event_category,event_name,id FROM ev_to_add_event WHERE start_date >= ?`;
        con.query(query, [moment(new Date()).format('YYYY-MM-DD')], (err, data) => {
          if (err) {
            reject(err);
          } else {
            var state = [];
            var city = [];
            var categories = [];
            var events = [];
            for (let i = 0; i < data.length; i++) {
              events.push({ id: data[i].id, name: data[i].event_name });
              state.push({ id: data[i].id, name: data[i].state });
              city.push({ id: data[i].id, name: data[i].city });
              categories.push({ id: data[i].id, name: data[i].event_category });
            }
            const newCities = city
              .map(e => e['name'])
              .map((e, i, final) => final.indexOf(e) === i && i)
              .filter(e => city[e]).map(e => city[e]);

            const newCategories = categories
              .map(e => e['name'])
              .map((e, i, final) => final.indexOf(e) === i && i)
              .filter(e => categories[e]).map(e => categories[e]);

            newData.city = newCities;
            newData.categories = newCategories;
            newData.event_names = events;
            resolve(newData);
          }
        })

      })
    }

    eventsData.then((events) => {
      if (events.length > 0) {
        return upcoming(events);
      }
    }).then((data) => {
      if (data.upcoming.length == 0) {
        data.upcoming = data.events;
      }
      return searchPayload(data);
    }).then((newData) => {
      module.exports.citiesEvent((callback) => {
        console.log("==== print callback data from ====>>>>====----", callback);
        if (callback.error == "false") {
          var newEvents = [];
          if(newData.events.length > 6){
             for(let i = 0; i< 6; i++){
               newEvents.push(newData.events[i]);
             }
          }else{
            newEvents = newData.events;
          }
          // const shuffled1 = newData.events.sort(() => 0.5 - Math.random());
          // let newEvents = shuffled1.slice(0, 6);
          const shuffled2 = newData.upcoming.sort(() => 0.5 - Math.random());
          let newUpcomings = shuffled2.slice(0, 3);
          res.json({
            status: 200,
            message: 'Events data',
            events: newEvents,
            upcoming: newUpcomings,
            city: newData.city,
            categories: newData.categories,
            event_names: newData.event_names,
            cities_event: callback.data,
            total_event: callback.total_event
          })
        }
        if (callback.error == "true") {
          response.internalError(500, "Error in components:user:controller:userController:getEvents", res);
        }
      })

    }).catch((err) => {
      console.log("==== console error from promises =====", err);
      response.internalError(500, "Error components:user:controller:userEventController:getEvents", res);
    })

  })

}


module.exports.citiesEvent = (callback) => {
  con.connect(function (err) {
    var getCities = new Promise((resolve, reject) => {
      let query = `SELECT city FROM ev_to_add_event WHERE start_date >= ?`;
      con.query(query, [moment(new Date()).format('YYYY-MM-DD')], (err, data) => {
        if (err) {
          reject(err);
        } else {
          var city = [];
          for (let i = 0; i < data.length; i++) {
            city.push({ id: data[i].id, name: data[i].city });
          }
          const newCities = city
            .map(e => e['name'])
            .map((e, i, final) => final.indexOf(e) === i && i)
            .filter(e => city[e]).map(e => city[e]);
          resolve(newCities);
        }
      })
    })

    var citiesEvent = (cities) => {
      var eventCities = [];
      return new Promise((resolve, reject) => {
        events = (name) => {
          let query = `SELECT COUNT(*) as total FROM ev_to_add_event WHERE start_date >= ? AND city = ?`;
          con.query(query, [moment(new Date()).format('YYYY-MM-DD'), name[0].toString()], (err, data) => {
            if (err) {
              reject(err);
            } else {
              eventCities.push({ name: name[0], total: data[0].total });
              cities.shift();
              if (cities.length > 0) {
                events(cities);
              }
              if (cities.length == 0) {
                resolve(eventCities);
              }
            }
          })

        }
        if (cities.length > 0) {
          events(cities);
        }
        if (cities.length == 0) {
          resolve(eventCities);
        }
      })
    }
    getCities.then((cities) => {
      if (cities.length > 0) {
        city = cities.map((city) => city.name);
        return citiesEvent(city);
      }
    }).then((data) => {
      let query = `SELECT COUNT(*) as total_event FROM ev_to_add_event WHERE start_date >= ?`;
      con.query(query, [moment(new Date()).format('YYYY-MM-DD')], (err, events) => {
        if (err) {
          callback({ error: "true", data: {} });
        } else {
          const shuffled = data.sort(() => 0.5 - Math.random());
          let shuffledData = shuffled.slice(0, 4);
          callback({ error: "false", data: shuffledData, total_event: events });
        }
      })

    }).catch((err) => {
      callback({ error: "true", data: {} });
    })
  })

}

module.exports.getEvent = (req, res) => {
  con.connect(function (err) {
    let query = 'SELECT * FROM ev_to_add_event WHERE event_slug = "' + req.body.event_id + '"';
    con.query(query, (err, data) => {
      if (err) {
        response.internalError(500, "Internal error", res);
      } else {
        let query = 'SELECT * FROM ev_to_ticket WHERE event_id = "' + req.body.event_id + '"';
        con.query(query, (err, ticket) => {
          if (err) {
            response.internalError(500, "Error components:admin:controller:eventController:getEvent", res);
          } else {
            // var start = moment.utc(data[0].start_date, 'MMMM Do YYYY').toDate().toUTCString();
            // var date_start = start.split(':')[0].split(' ')[0] + " " + start.split(':')[0].split(' ')[1] + " " + start.split(':')[0].split(' ')[2] + " " + start.split(':')[0].split(' ')[3];
            // data[0].start_date = date_start;
            var hr;
            var newformat = data[0].start_time.split(':')[0]  >= 12 ? 'PM' : 'AM';
            if(data[0].start_time.split(':')[0] > 12){
            hr = data[0].start_time.split(':')[0] - 12;
            }
            if(data[0].start_time.split(':')[0] < 12){
              hr = data[0].start_time.split(':')[0];
            }
            if(data[0].start_time.split(':')[0]  == '00'){
              hr = 12;
            }
             data[0].start_time  = hr + ':' +data[0].start_time.split(':')[1] +' '+newformat;
            return res.json({
              status: 200,
              message: "Event data ",
              data: data,
              ticket: ticket

            })
          }

        })

      }
    })

  })

}




//Get list of events and upcoming events
module.exports.eventList = (req, res) => {
  console.log("==== print number page getting from frontend =====>>>.", req.body)
  var params = req.body;
  params.limit = 3;
  var payload, query;
  var search_dates = [];
  var offset = (params.page || 1) * params.limit - params.limit;

  con.connect(function (err) {
    var eventsData = new Promise((resolve, reject) => {
      var event_query = `SELECT * FROM ev_to_add_event WHERE start_date >= ? ORDER BY start_date DESC LIMIT ${params.limit} OFFSET ${offset}`;
      con.query(event_query, [moment(new Date()).format('YYYY-MM-DD')], (err, data) => {
        // console.log("===== print data after skiping value ====>>>", data);
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      })
    })

    var upcoming = (events) => {
      return new Promise((resolve, reject) => {
        var date = new Date();
        var lastDayMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        var listdayofmonth = [];
        listdayofmonth.push(new Date());
        var today = new Date();
        function dateOfMonth() {
          var comp_today = today;
          var comp_last = lastDayMonth;
          if (JSON.stringify(comp_today).split('T')[0].split('"')[1] < JSON.stringify(comp_last).split('T')[0].split('"')[1]) {
            listdayofmonth.push(new Date(today.setDate(today.getDate() + 1)));
            dateOfMonth();
          }
        }
        dateOfMonth();
        for (let i = 0; i < listdayofmonth.length; i++) {
          search_dates.push(JSON.stringify(listdayofmonth[i]).toString().split('T')[0].split('"')[1]);
        }
        payload = search_dates;
        query = `SELECT * FROM ev_to_add_event  WHERE start_date  IN  (${'"' + payload.join('","') + '"'})  ORDER BY start_date `;

        con.query(query, (err, upcoming) => {
          if (err) {
            reject(err);
          } else {
            var data = {
              events: events,
              upcoming: upcoming
            }
            resolve(data);
          }

        })

      })

    }

    var searchPayload = (newData) => {
      return new Promise((resolve, reject) => {
        let query = `SELECT city,state,event_category,event_name,id FROM ev_to_add_event WHERE start_date >= ?`;
        con.query(query, [moment(new Date()).format('YYYY-MM-DD')], (err, data) => {
          if (err) {
            reject(err);
          } else {
            var state = [];
            var city = [];
            var categories = [];
            var events = [];
            for (let i = 0; i < data.length; i++) {
              events.push({ id: data[i].id, name: data[i].event_name });
              state.push({ id: data[i].id, name: data[i].state });
              city.push({ id: data[i].id, name: data[i].city });
              categories.push({ id: data[i].id, name: data[i].event_category });
            }
            const newCities = city
              .map(e => e['name'])
              .map((e, i, final) => final.indexOf(e) === i && i)
              .filter(e => city[e]).map(e => city[e]);
            const newEvents = events
              .map(e => e['name'])
              .map((e, i, final) => final.indexOf(e) === i && i)
              .filter(e => city[e]).map(e => city[e]);
            const newCategories = categories
              .map(e => e['name'])
              .map((e, i, final) => final.indexOf(e) === i && i)
              .filter(e => categories[e]).map(e => categories[e]);

            newData.city = newCities;
            newData.categories = newCategories;
            newData.events = newData.events;
            newData.event_names = newEvents;
            resolve(newData);
          }
        })

      })
    }

    eventsData.then((events) => {
      if (events.length > 0) {
        return upcoming(events);
      }
    }).then((data) => {
      if (data.upcoming.length == 0 ||data.upcoming.length < 3 ) {
        data.upcoming = data.events;
      }
      return searchPayload(data);
    }).then((newData) => {

      let query = `SELECT COUNT(*) as total_event FROM ev_to_add_event WHERE start_date >= ?`;
      con.query(query, [moment(new Date()).format('YYYY-MM-DD')], (err, events) => {
        if (err) {
          response.internalError(500, "Error components:user:controller:userEventController:getEvents", res);
        } else {
          const shuffled = newData.upcoming.sort(() => 0.5 - Math.random());
          let shuffledData = shuffled.slice(0, 3);
          res.json({
            status: 200,
            message: 'Events data',
            events: newData.events,
            upcoming: shuffledData,
            city: newData.city,
            categories: newData.categories,
            event_names: newData.event_names,
            limit: params.limit,
            total_event: events
          })
        }
      })

    }).catch((err) => {
      console.log("==== console error from promises =====", err);
      response.internalError(500, "Error components:user:controller:userEventController:getEvents", res);
    })

  })

}

