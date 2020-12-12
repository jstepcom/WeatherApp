//Variables
let celsius = document.querySelector("#celcius");
let farenheith = document.querySelector("#farenheith");
let week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let days = ["one","two","three","four","five","six"];
let date = new Date(); 
let tzData = ""; 
let increm = 0;

//Weather Api Vars
let apiKey = "b04fe89ae8d23d63826a70cf52ffdc7c";
let currUrl = `https://api.openweathermap.org/data/2.5/weather?`;
let dailyUrl = `https://api.openweathermap.org/data/2.5/onecall?`;
let apiUrl = ``;
let lat = 0;
let lon = 0;
let unit = "metric";
let sys = ["C","km/h"];

/** 
* For each element of the array day searhc the following 5 days and put them in the right order.
* @param {Int} element - get the element name of the html
* @param {Int} index - the consecutive number for each iteration
*/
function setDay(element, index){
  let dayElement = document.querySelector("#"+element); 
  if ((date.getDay()+index+1)>=7){  
    dayElement.innerHTML = `${week[increm]}`;
    increm = increm+1;
  }else{
   dayElement.innerHTML = `${week[date.getDay()+index+1]}`; 
  }
  console.log(dayElement, increm, index)
}
/** 
* Get the hour and minutes, if minutes is <10 add a 0 to have :0x.
*/
function setTime(){
  let time = document.querySelector("#date");  
  if (date.getMinutes()>=10){
    time.innerHTML = `${
      week[date.getDay()]
      } ${date.getDate()}, ${date.getHours()}:${date.getMinutes()}`;
  }else{
    time.innerHTML = `${
      week[date.getDay()]
      } ${date.getDate()}, ${date.getHours()}:0${date.getMinutes()}`;
  }
}
/** 
* Get the info of the api of the next 6 days.
* @param {JSON} response - Get the weather Api info.
*/
function getForecast(response){
  //Vars from html
  let pressure = document.querySelector("#pressure");
  let windSpeed = document.querySelector("#wind");
  let uvIndex = document.querySelector("#uvi");
  let humidity = document.querySelector("#humidity");
  let limits = document.querySelectorAll(".lim");
  let iconElement = document.querySelectorAll(".icon");
 // Vars for the api data
  let presData = response.data.current.pressure;
  let windData = response.data.current.wind_speed;
  let uviData = response.data.current.uvi;
  let humiData = response.data.current.humidity;
  let iconData = null;
  tzData = response.data.timezone;
  //Other variables
  let max = [];
  let min = [];
  if (unit==="metric"){sys = ["C","km/h"];}
  else{sys = ["F","mi/h"]}
  // Time info
  date = new Date (date.toLocaleString("en-US", {timeZone: tzData}));
  setTime();//Set current time 
  //Set maximum and minimum of the next 5 days
  for (let i=0;i<6;i++){
   max [i] = Math.round(response.data.daily[i].temp.max);
   min [i]= Math.round(response.data.daily[i].temp.min);
   limits [i].innerHTML = `${max[i]}° - <span style ='font-size:13px'>${min[i]}°</span>`;
   iconData = response.data.daily[i].weather[0].icon;
   iconElement[i].setAttribute("src",`http://openweathermap.org/img/wn/${iconData}@2x.png`);
   iconElement[i].setAttribute("alt",response.data.daily[i].weather[0].description);
  }  
  //Replace values in html
  pressure.innerHTML = `${presData} hPa`;
  windSpeed.innerHTML = `${windData} ${sys[1]}`;
  uvIndex.innerHTML = Math.round(uviData);
  humidity.innerHTML = `${humiData}%`;
  days.forEach(setDay);
}
function setImage(response){
  console.log(response);
  
}
/** 
* Get the temperature and other data from the weather Api and show it in the html.
* @param {JSON} response - Get the weather api info.
*/
function getTemperature(response){
  // Vars from html
  let location = document.querySelector(".city");
  let temperature = document.querySelector("#temperature");
  let weather = document.querySelector("#today");
  let mainIconElement = document.querySelector("#mainIcon")
  // Vars for the api data
  let temp = response.data.main.temp;
  let sky = response.data.weather[0].description;
  let max = response.data.main.temp_max;
  let min = response.data.main.temp_min;
  let latitude = response.data.coord.lat;
  let longitud = response.data.coord.lon;
  let mainIconData = response.data.weather[0].icon;
  let cityName = response.data.name;
  //Replace info in html
  sky = sky.charAt(0).toUpperCase()+sky.slice(1);
  temperature.innerHTML = Math.round(temp);
  location.innerHTML = `${cityName}, <span style = 'font-size:20px'>${response.data.sys.country}</span>`;
  weather.innerHTML = `${sky} |<span style = 'font-size:20px'> Max. ${Math.round(max)}° - Min. ${Math.round(min)}°</span>`;
  mainIconElement.setAttribute("src",`http://openweathermap.org/img/wn/${mainIconData}@2x.png`);
  mainIconElement.setAttribute("alt", response.data.weather[0].description);
  //setImage(cityName);
  //Get Forecast data
  apiUrl = `${dailyUrl}lat=${latitude}&lon=${longitud}&units=${unit}&appid=${apiKey}`;
  axios.get(apiUrl).then(getForecast);
  /*Picture API
  let gKey=`AIzaSyDyrWvDTyHza8d4mIG1yLk7oXZLCDGImJY`;
  let gUrl =`https://maps.googleapis.com/maps/api/place/photo?${cityName}&${gKey}`;
  axios.get(gUrl).then(setImage);*/
}
/** 
* Get the information of the form and send the city name to the Api, call the function to get the temperature.
* @param {ParamDataTypeHere} event - .
*/
function searchCity(event) {
  event.preventDefault();
  let city = document.querySelector(".form-control").value;
  unit = "metric";
  date = new Date();
  celsius.style.fontWeight='bold';
  farenheith.style.fontWeight='normal';
  if (city === "") {
    document.querySelector(".form-control").focus();
    Swal.fire({
      position: 'top-end',
      icon: 'warning',
      title: 'Please type a city',
      showConfirmButton: false,
      timer: 1000
    })
  } else {
    increm = 0;
    apiUrl = `${currUrl}q=${city}&units=${unit}&appid=${apiKey}`;
    axios.get(apiUrl).then(getTemperature);
  } 
}
/** 
* Set the apiUrl to get the data for the current location.
* @param {JSON} position - Geolocation information latitude, longitude of the current location.
*/
function getPosition(position){
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  apiUrl = `${currUrl}lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
  axios.get(apiUrl).then(getTemperature);
}
/** 
* Change the system unit to imerial or metric.
* @param {Int} index - 
*/
function changeUnit(index){
  let city = document.querySelector(".city").textContent;
  increm = 0;
  city = city.split(",");
  if (index === 0){
    unit = "metric";
    celsius.style.fontWeight='bold';
    farenheith.style.fontWeight='normal';
  }else{
    unit = "imperial";
    celsius.style.fontWeight='normal';
    farenheith.style.fontWeight='bold';
  }
  apiUrl = `${currUrl}q=${city[0]}&units=${unit}&appid=${apiKey}`;
  axios.get(apiUrl).then(getTemperature);
}
/** 
* Set everything to the current location and metric system.
*/
function restart(){
    increm = 0;
    date = new Date();
    unit = "metric";
    celsius.style.fontWeight='bold';
    farenheith.style.fontWeight='normal';
    document.getElementById("search").reset();
    apiUrl = `${currUrl}lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`;
    axios.get(apiUrl).then(getTemperature);
}
navigator.geolocation.getCurrentPosition(getPosition);
let form = document.querySelector("#search");
let button = document.querySelector(".current-loc");
let units = document.querySelectorAll(".sup");
form.addEventListener("submit",searchCity);
button.addEventListener('click',restart);
units.forEach (function(item,index) /*=>*/ {
  item.addEventListener('click',function () {
    changeUnit(index);
  })
});