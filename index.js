document.addEventListener("DOMContentLoaded", () => {
  let years = [];
  let rawCSVData = [];
  let selectedMode = "historical";
  let selectedPeriod = document.getElementById('selectedPeriod');

  getAllData();

  selectedPeriod.addEventListener('input', () => {
    let month = parseInt(selectedPeriod.value.split('-')[1]);
    let year = selectedPeriod.value.split('-')[0];

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];   
    month = monthNames[ month - 1]
    // Reload Chart
    extractAllData(month, year)
  })

  document.getElementById('historicalMode').addEventListener('click', () => {
    selectedMode = 'historical';
    document.getElementById('forecastMode').classList.remove('selected');
    document.getElementById('historicalMode').classList.add('selected');

    //Enable filter
    document.getElementById("filter-con").classList.remove("hide");
    // Forecast data
    getAllData();
  })

  document.getElementById('forecastMode').addEventListener('click', () => {
    selectedMode = 'forecast';
    document.getElementById('forecastMode').classList.add('selected');
    document.getElementById('historicalMode').classList.remove('selected');
    //Enable filter
    document.getElementById("filter-con").classList.add("hide");
    // Forecast data
    getAllData();
  })

  function getMonthNumber(monthName) {
    const monthMap = {
      'January': '01',
      'February': '02',
      'March': '03',
      'April': '04',
      'May': '05',
      'June': '06',
      'July': '07',
      'August': '08',
      'September': '09',
      'October': '10',
      'November': '11',
      'December': '12'
    };

    // Convert the month name to title case (e.g., "january" to "January")
    const formattedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase();

    return monthMap[formattedMonthName];
  }

  async function getAllData() {
    const response = await fetch('/fuel.csv');
    const tabledata = await response.text();
    rawCSVData = tabledata.split('\n').slice(1);

    extractYears();
    extractAllData('March', '2021');
  }

  function extractYears() {
    rawCSVData.forEach(row => {
      const column = row.split(',');
      years.push(column[0]);
    });
    years = [...new Set(years)];
  }

  function forecast(type) {
    const pastData = extractOneData(extractLatestData(), type);
    

    const maxValue = Math.max(...pastData);
    const minValue = Math.min(...pastData);

    const differenceInPercentage = ((maxValue - minValue)/maxValue) + 1;
    let forecastData = [];
    if(type == "label") {
      forecastData.push(...['Sep, 2022', 'Oct, 2022', 'Nov, 2022', 'Dec, 2022', 'Jan, 2023', 'Feb, 2023', 'Mar, 2023', 'Apr, 2023', 'May, 2023', 'June, 2023', 'Jul, 2023', 'Aug, 2023'])
    }
    else {
      for(let i=0; i < pastData.length; i++) {
        forecastData.push(pastData[i] * differenceInPercentage);
      }
    }
    
    return forecastData
  }

  function extractLatestData() {
    const endIndex = rawCSVData.length;
    return rawCSVData.slice(endIndex - 12, endIndex);
  }

  function extractAllData(month, year) {
    // find if that date exists
    let checkIndex = rawCSVData.findIndex(row => row.includes(`${year},${month}`));
    
    // if it does not, show error
    if (checkIndex == -1) {
      document.getElementById('NoDate').style.display = "flex";
      return;
    }

    document.getElementById('NoDate').style.display = "none";

    // if it does, extract 12 from csv data
    const endIndex = (checkIndex + 12 <= rawCSVData.length) ? (checkIndex + 12) : rawCSVData.length;
    let extractedData = rawCSVData.slice(checkIndex, endIndex);
    // add to array 
    let chartData = loadChartData(extractedData);
    // load to chart
    drawChart(chartData);
    // set input to date
    selectedPeriod.value = `${year}-${getMonthNumber(month)}`;
  }

  function extractOneData(data, type) {
    let extractedType = [];
    data.forEach(row => {
      const column = row.split(',');
      if (type == 'label') {
        extractedType.push(`${column[1].slice(0, 3)},${column[0]}`)
      }
      if (type == 'solid') {
        extractedType.push(column[2])
      }
      if (type == 'gas') {
        extractedType.push(column[3])
      }
      if (type == 'electricity') {
        extractedType.push(column[4])
      }
      if (type == 'liquid') {
        extractedType.push(column[5])
      }

    });

    return extractedType;
  }

  function loadChartData(extractedData) {
    console.log(forecast('solid'), selectedMode)

    return {
      labels: selectedMode == "historical" ? extractOneData(extractedData, 'label') : forecast('label'),
      datasets: [
        {
          label: "Solid Fuel",
          data: selectedMode == "historical" ? extractOneData(extractedData, 'solid') : forecast('solid'),
          borderWidth: 2,
          borderColor: "red",
          fill: false,
          pointRadius: 1,
        },
        {
          label: "Liquid Fuel",
          data: selectedMode == "historical" ? extractOneData(extractedData, 'liquid') : forecast('liquid'),
          borderWidth: 2,
          borderColor: "green",
          fill: false,
          pointRadius: 1,
        },
        {
          label: "Gas",
          data: selectedMode == "historical" ? extractOneData(extractedData, 'gas') : forecast('gas'),
          borderWidth: 2,
          borderColor: "yellow",
          fill: false,
          pointRadius: 1,
        },
        {
          label: "Electricity",
          data: selectedMode == "historical" ? extractOneData(extractedData, 'electricity') : forecast('electricity'),
          borderWidth: 2,
          borderColor: "blue",
          fill: false,
          pointRadius: 1,
        },
      ],
    }
  }

  async function drawChart(data) {

    // config
    const config = {
      type: "line",
      data,
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };

    if(window.myChart instanceof Chart) {
      window.myChart.destroy();
    }

    // render init block
    window.myChart = new Chart(document.getElementById("myChart"), config);
    // document.getElementById("myChart").style.width = "100%";
    // document.getElementById("myChart").style.height = "250px";

    // Instantly assign Chart.js version
    const chartVersion = document.getElementById("chartVersion");
  }
})