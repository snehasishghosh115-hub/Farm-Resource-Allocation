
const API_URL = "http://localhost:8000/optimize";



async function optimize() {

  
  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);
  const water = Number(document.getElementById("water").value);


  
  if (rows <= 0 || cols <= 0) {
    alert("Rows and Columns must be greater than 0");
    return;
  }

  if (water < 0) {
    alert("Water limit cannot be negative");
    return;
  }


  
  showMessage("⏳ Optimizing farm layout...");


  
  const payload = {

    rows: rows,
    cols: cols,
    soil_type: "loamy",

    water_limit: water,

    crops: [
      { name: "Wheat", water: 3, profit: 5, soil: "loamy" },
      { name: "Rice",  water: 6, profit: 8, soil: "clay"  },
      { name: "Corn",  water: 4, profit: 6, soil: "sandy" }
    ]
  };


  
  try {

    const response = await fetch(API_URL, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)
    });


    if (!response.ok) {
      throw new Error("Server Error");
    }


    const data = await response.json();


    
    drawGrid(data.rows, data.cols, data.layout);

    showMessage("✅ Optimization Complete!");


  }
  catch (error) {

    console.error(error);

    showMessage("❌ Backend not running / Connection failed");

  }

}



function drawGrid(rows, cols, layout) {

  const grid = document.getElementById("grid");

  grid.innerHTML = "";

  grid.style.gridTemplateColumns =
    `repeat(${cols}, 60px)`;


  layout.forEach((crop, index) => {

    const cell = document.createElement("div");

    cell.classList.add("cell", crop);

    cell.innerText = crop;

    cell.title = `Plot ${index + 1}: ${crop}`;

    grid.appendChild(cell);

  });

}



function showMessage(text) {

  let msg = document.getElementById("status-msg");


  if (!msg) {

    msg = document.createElement("p");

    msg.id = "status-msg";

    msg.style.marginTop = "15px";
    msg.style.fontWeight = "600";

    document
      .querySelector(".card")
      .appendChild(msg);
  }


  msg.innerText = text;
