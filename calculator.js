var period = 60; // Время, к которому приводим производительность, секунд

var select = document.getElementById("itemSelect");
var countInput = document.getElementById("count");
var calculateInput = document.getElementById("btn");
var tableBlock = document.getElementById('table');
var calculateResultTable = document.getElementById('tableList');
// Логика калькулятора
// Достаем объект предмета из памяти
function getItemByName(name) {
  for(item of data.items) {
    if(item.name == name) {
      return item;
    }
  }
  throw new Error(`Cannot find item with name: ${util.inspect(name)}`)
}

// Достаем объект фабрики из памяти
function getFactorioByType(factoryName, factoryType) {
  for (factorio of data[factoryType]) {
    if (factorio.name == factoryName) {
      return factorio;
    }
  }
  throw new Error(`Cannor find factorio with name ${factorioType}`);
}

// Расчитываем количество заводов определенного типа, для создания определенного количества определенных предметов
function calculateOneItem(itemName, count, factoryName, factoryType = 'factorios') {
  // console.log('calculate item: ' + itemName)
  var itemProps = getItemByName(itemName);
  var factorioProps = getFactorioByType(factoryName, factoryType);

  /* Формула: (Желаемое количество * Время одной итерации изготовления) /
   * (Период, к которому приводим * Количество изготавливаемых предметов за раз * Скорость работы завода)
   */
  return (count * itemProps.productionTime)/(period * itemProps.productionCount * factorioProps.workSpeed);
}

// Рекурсивно считаем количество предметов каждого типа, которые нужны
var bufferOfAllItems = {};

function createTreeOfItems(itemName, count) {
  var itemProps = getItemByName(itemName);
  // console.log('tree: ' + itemName);

  if (itemProps.name in bufferOfAllItems) {
    // console.log('Increment: ' + bufferOfAllItems[itemProps.name] + ' ' + count);
    bufferOfAllItems[itemProps.name] = bufferOfAllItems[itemProps.name] + count;
  } else {
    bufferOfAllItems[itemProps.name] = count;
  }
  if (!itemProps.isBaseItem) {
    for(item of itemProps.resources) {
      createTreeOfItems(item.name, item.requiredCount * count);
    }
  }
}

//
function createLine(itemKey) {
  var resultString;

  var itemProps = getItemByName('' + itemKey);

  if (itemProps.factorioType == 'furnaces') {
    var f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '2', 'furnaces'); // стальная печь
    var f2 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '3', 'furnaces'); // электрическая 2х2 печь

    resultString = `${itemKey.padEnd(30)} : ${f2.toFixed(2).padEnd(20)} : ${f1.toFixed(2).padEnd(20)}`;
  } else if(itemProps.factorioType == 'chemicalFactories') {
    var f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '1', 'chemicalFactories'); // электрическая печь

    resultString = `${itemKey.padEnd(30)} : ${f1.toFixed(2).padEnd(20)}`;
  } else if(itemProps.factorioType == 'none') {
    resultString = `${itemKey.padEnd(30)} : этот ресурс не производится`;
  } else {
    var f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '1');
    var f2 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '2');
    var f3 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '3');

    resultString = `${itemKey.padEnd(30)} : ${f3.toFixed(2).padEnd(20)} : ${f2.toFixed(2).padEnd(20)} : ${f1.toFixed(2).padEnd(20)}`;
  }


  return resultString;
}

function createArrayTr(itemKey) {
  var resultArray = [];
  var itemProps = getItemByName('' + itemKey);

  if (itemProps.factorioType == 'furnaces') {
    var f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '3', 'furnaces'); // стальная печь
    var f2 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '2', 'furnaces'); // электрическая 2х2 печь

    var f0tr = document.createElement("td");
    f0tr.append(itemProps.name);
    var f1tr = document.createElement("td");
    f1tr.append(f1.toFixed(2));
    var f2tr = document.createElement("td");
    f2tr.append(f2.toFixed(2));

    resultArray.push(f0tr);
    resultArray.push(f1tr);
    resultArray.push(f2tr);
  } else if(itemProps.factorioType == 'chemicalFactories') {
    var f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '1', 'chemicalFactories'); // электрическая печь
    var f1tr = document.createElement("td");
    f1tr.append(f1.toFixed(2));
    var f0tr = document.createElement("td");
    f0tr.append(itemProps.name);

    resultArray.push(f0tr);
    resultArray.push(f1tr);
  } else if(itemProps.factorioType == 'none') {
    resultString = `${itemKey.padEnd(30)} : этот ресурс не производится`;
  } else {
    var f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '3');
    var f2 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '2');
    var f3 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '1');

    var f0tr = document.createElement("td");
    f0tr.append(itemProps.name);
    var f1tr = document.createElement("td");
    f1tr.append(f1.toFixed(2));
    var f2tr = document.createElement("td");
    f2tr.append(f2.toFixed(2));
    var f3tr = document.createElement("td");
    f3tr.append(f3.toFixed(2));

    resultArray.push(f0tr);
    resultArray.push(f1tr);
    resultArray.push(f2tr);
    resultArray.push(f3tr);
  }

  return resultArray
}

function createTableHeader() {
  var headerRow = document.createElement('tr');
  calculateResultTable.append(headerRow);
  var header0 = document.createElement("th");
  header0.append('Название');
  headerRow.append(header0);

  var header1 = document.createElement("th");
  header1.append('Желтый 4х2 Эл.печь 2х2 Химзавод');
  headerRow.append(header1);
  var header2 = document.createElement("th");
  header2.append('Желтый Эл.печь');
  headerRow.append(header2);
  var header3 = document.createElement("th");
  header3.append('Синий');
  headerRow.append(header3);
}

function parseAndCalculate(selectedValue, selectedCount) {
  var itemName = selectedValue;
  var count = parseInt(selectedCount);

  bufferOfAllItems = {};
  createTreeOfItems(itemName, count);

  // console.log(bufferOfAllItems);
  var str0 = 'Название предмета';
  var str1 = 'Желтая 4х2 / Эл.печь';
  var str2 = 'Желтая / Ст. печь';
  var str3 = 'Синяя';
  console.log(`${str0.padEnd(30)} : ${str1.padEnd(20)} : ${str2.padEnd(20)} : ${str3.padEnd(20)}`)

  for(itemKey of Object.keys(bufferOfAllItems)) {
    console.log(createLine(itemKey));
  }
}

// Обработка событий

function startCalculate() {
  select = document.getElementById("itemSelect");

  var selectedValue = select.options[select.selectedIndex].text;
  var selectedCount = countInput.value;

  parseAndCalculate(selectedValue, selectedCount);

  calculateResultTable.remove();

  calculateResultTable = document.createElement('table');
  calculateResultTable.id = 'tableList';
  tableBlock.appendChild(calculateResultTable);
  createTableHeader();

  for(itemKey of Object.keys(bufferOfAllItems)) {
    var tr = document.createElement('tr');
    var arrayOfField = createArrayTr(itemKey);

    for(trItem of arrayOfField) {
      tr.appendChild(trItem);
    }

    calculateResultTable.appendChild(tr);
  }

}
