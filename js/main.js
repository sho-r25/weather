// -------------------------
// DOM
// -------------------------
const screenWrap = document.getElementById("screenWrap");
const select = document.getElementById("selectPlace");
const input = document.querySelector("input");
const getZipBtn = document.getElementById("getZip");
const errorMsg = document.getElementById("errorMsg");
const today = document.getElementById("today");
const place = document.getElementById("place");
const description = document.getElementById("description");
const img = document.getElementById("nowImg");
const temperature = document.getElementById("temperature");
const maxTemp = document.getElementById("maxTemp");
const minTemp = document.getElementById("minTemp");
const datesWrap = document.getElementById("datesWrap");



// -------------------------
// Get Todady's Date
// -------------------------
today.textContent = `${new Date().getMonth() + 1}/${new Date().getDate()}`;




// -------------------------
// Get Weather from placeName
// -------------------------
async function getNameApi(placeDate) {
  const weather = await nameApi(placeDate);
  getDate(weather);

  const weekweather = await weeksNameApi(placeDate);
  getDate2(weekweather);
}

// -------------------------
// Get Weather from zipCode
// -------------------------
async function getZipApi(zipDate) {
  const weather = await zipApi(zipDate);
  getDate(weather);

  const weekweather = await weeksZipApi(zipDate);
  getDate2(weekweather);

}




// -------------------------
// Get Api from placeName
// -------------------------
async function nameApi(placeDate) {
  const res = await fetch("https://api.openweathermap.org/data/2.5/weather?q=" + placeDate + ",jp&appid=83971f1ef4e49948cf77a9d8f2e91c54&units=metric");
  const nameWeather = await res.json();
  input.classList.remove("inputError");
  errorMsg.textContent = "";
  zipError = 0;
  return nameWeather;
}

async function weeksNameApi(placeDate) {
  const weeksRes = await fetch("https://api.openweathermap.org/data/2.5/forecast?q=" + placeDate + ",jp&appid=83971f1ef4e49948cf77a9d8f2e91c54&units=metric");
    const weeksNameWeather = await weeksRes.json();
    return weeksNameWeather;
}



// -------------------------
// Get Api from zipCode
// -------------------------
async function zipApi(zipDate) {
  const res = await fetch("https://api.openweathermap.org/data/2.5/weather?zip=" + zipDate + "&appid=83971f1ef4e49948cf77a9d8f2e91c54&units=metric");
  handleErrors(res);
  
  const zipWeather = await res.json();
  return zipWeather;
}

async function weeksZipApi(zipDate) {
  const weeksRes = await fetch("https://api.openweathermap.org/data/2.5/forecast?zip=" + zipDate + "&appid=83971f1ef4e49948cf77a9d8f2e91c54&units=metric");
  const weeksZipWeather = await weeksRes.json();
  return weeksZipWeather;
}



// -------------------------
// Error Check (zipcode)
// -------------------------
//fetch()から返されるPromiseは、HTTPエラーステータスの場合でも拒否されない("okステータス"が"false"にセットされる)ため、以下処理。
let zipError = 0; 
const handleErrors = (res) => {
  if (res.ok) {
    input.classList.remove("inputError");
    errorMsg.textContent = "";
    zipError = 0;
    return res;

  } else {
    input.classList.add("inputError");
    errorMsg.textContent = "正しい郵便番号を入力して下さい";
    zipError++;
    if (zipError >= 2) {
      // 市区町村をまたいで同じ郵便番号を持つ地域や、「0」から始まる郵便番号の場合（←何故か不明）はAPIから郵便番号で検索できないため以下処理。
      errorMsg.textContent = "※0から始まる郵便番号、または一部地域の郵便番号は検索ができないため都道府県より選択して下さい"; 
    }
    throw new Error;
  }
}




// -------------------------
// Common Method
// -------------------------
function getDate(weather) {
  // Set Place
  place.textContent = weather.name;

  // Set description
  description.textContent = weather.weather[0].main;

  // Set Icon & BackImg
  const iconNom = weather.weather[0].icon;
  img.src = "http://openweathermap.org/img/wn/" + iconNom + "@2x.png";

  // Icon「50d」の天気は「砂」や「竜巻」などイレギュラーのため、if文で背景画像を指定。
  // Iconが「nightCheack」のどれかなら、背景画像を「夜ver」に指定。
  const background = weather.weather[0].main;
  const nightCheack = iconNom === "01n" ||  iconNom === "02n" ||  iconNom === "03n" ||  iconNom === "04n";

  if (iconNom === "50d" || iconNom === "50n") {
    screenWrap.style.backgroundImage = "url(./img/Drizzle.jpg)";
  } else if (nightCheack) {
    screenWrap.style.backgroundImage = "url(./img/Night.jpg)";
  } else {
    screenWrap.style.backgroundImage = "url(./img/" + background + ".jpg)";
  }


  // Set Temperatures
  temperature.textContent = Math.round(weather.main.temp) + "°";
  maxTemp.textContent = Math.round(weather.main.temp_max) + "°";
  minTemp.textContent = Math.round(weather.main.temp_min) + "°";
}




// -------------------------
// Event
// -------------------------
window.addEventListener("load", () => {
  const num = select.selectedIndex;
  const placeDate = select.options[num].value;
  getNameApi(placeDate);
});


select.addEventListener("change", () => {
  const num = select.selectedIndex;
  const placeDate = select.options[num].value;
  getNameApi(placeDate);
  select.selectedIndex = 0;
  input.value = "";
});


getZipBtn.addEventListener("click", () => {
  const zipDate = input.value + ",jp";
  if (zipDate.length !== 11) {
    input.classList.add("inputError");
    errorMsg.textContent = "※郵便番号はハイフンを含めた8文字で入力して下さい (例:123-0000)";
    return;
  }
  getZipApi(zipDate);
  input.value = "";
  input.placeholder = "〒123-0000";
});




// ====================================================================
//  --- ↓ From here ↓ --- Get Weather's Data for 4days!
// ====================================================================


// -------------------------
// Class (Data and Method)
// -------------------------
class WeekData {
  constructor(weekDate, weekIcon, weekTemp, weekHumidity) {
    const section = document.createElement("section");
    section.classList.add("sctWrap");

    // 4days
    this.dates = document.createElement("div");
    this.dates.textContent = weekDate;
    this.dates.classList.add("dates");

    // Icon
    this.datesImg = document.createElement("img");
    this.datesImg.src = "http://openweathermap.org/img/wn/" + weekIcon + "@2x.png";
    this.datesImg.classList.add("datesImg");

    // Temp
    this.dateTemp = document.createElement("div");
    this.dateTemp.textContent = Math.round(weekTemp) + "°";
    this.dateTemp.classList.add("aadateTempa");

    // Humidity
    this.dateHumidity = document.createElement("div");
    this.dateHumidity.textContent = Math.round(weekHumidity) + "%";
    this.dateHumidity.classList.add("dateHumidity");

    // DOM
    section.appendChild(this.dates);
    section.appendChild(this.datesImg);
    section.appendChild(this.dateTemp);
    section.appendChild(this.dateHumidity);

    datesWrap.appendChild(section);
  }
}



// -------------------------
// Set Date
// -------------------------
function adjustDate(data) {
  const month = data.substr(5,2);
  const date = data.substr(8,2);
  const setDate = month + "/" + date;
  return setDate;
};


// -------------------------
// Delete 4days Data
// -------------------------
function clearWeek() {
  while (datesWrap.firstChild) {
    datesWrap.removeChild(datesWrap.firstChild);
  }
}



// -------------------------
// Create Instance
// -------------------------
//明日以降は常に日中の天気を表示させたいため、時間帯によって条件分岐させる
// Get Hour
const nowHour = new Date().getHours();

function getDate2(weekweather) {
  clearWeek();

  if(nowHour <= 8) {
    for(let i = 0; i < 4; i++) {
      new WeekData(
        adjustDate(weekweather.list[10 + 8 * i].dt_txt),
        weekweather.list[10 + 8 * i].weather[0].icon,
        weekweather.list[10 + 8 * i].main.temp,
        weekweather.list[10 + 8 * i].main.humidity,
      );
    }
  } else if(nowHour <= 17) {
    for(let i = 0; i < 4; i++) {
      new WeekData(
        adjustDate(weekweather.list[7 + 8 * i].dt_txt),
        weekweather.list[7 + 8 * i].weather[0].icon,
        weekweather.list[7 + 8 * i].main.temp,
        weekweather.list[7 + 8 * i].main.humidity,
      );
    }
  } else {
    for(let i = 0; i < 4; i++) {
      new WeekData(
        adjustDate(weekweather.list[4 + 8 * i].dt_txt),
        weekweather.list[4 + 8 * i].weather[0].icon,
        weekweather.list[4 + 8 * i].main.temp,
        weekweather.list[4 + 8 * i].main.humidity,
      );
    }
  }  
}
