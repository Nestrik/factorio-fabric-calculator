const readline = require('readline');

const period = 60; // Время, к которому приводим производительность, секунд

// Читаем файл с данными
const allDatas = {}
const allItemsNames = [];

const jsonData = JSON.parse(data);
allDatas.items = jsonData.items;
allDatas.factorios = jsonData.factorios;
allDatas.furnaces = jsonData.furnaces;
allDatas.chemicalFactories = jsonData.chemicalFactories;

for(itemData of allDatas.items) {
  allItemsNames.push(itemData.name);
}

// Достаем объект предмета из памяти
function getItemByName(name) {
  for(item of allDatas.items) {
    if(item.name == name) {
      return item;
    }
  }
  throw new Error(`Cannot find item with name: ${util.inspect(name)}`)
}

// Достаем объект фабрики из памяти
function getFactorioByType(factoryName, factoryType) {
  for (factorio of allDatas[factoryType]) {
    if (factorio.name == factoryName) {
      return factorio;
    }
  }
  throw new Error(`Cannor find factorio with name ${factorioType}`);
}

// Расчитываем количество заводов определенного типа, для создания определенного количества определенных предметов
function calculateOneItem(itemName, count, factoryName, factoryType = 'factorios') {
  // console.log('calculate item: ' + itemName)
  const itemProps = getItemByName(itemName);
  const factorioProps = getFactorioByType(factoryName, factoryType);

  /* Формула: (Желаемое количество * Время одной итерации изготовления) /
   * (Период, к которому приводим * Количество изготавливаемых предметов за раз * Скорость работы завода)
   */
  return (count * itemProps.productionTime)/(period * itemProps.productionCount * factorioProps.workSpeed);
}

// Рекурсивно считаем количество предметов каждого типа, которые нужны
let bufferOfAllItems = {};

function createTreeOfItems(itemName, count) {
  const itemProps = getItemByName(itemName);
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
  let resultString;

  const itemProps = getItemByName('' + itemKey);

  if (itemProps.factorioType == 'furnaces') {
    const f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '2', 'furnaces'); // стальная печь
    const f2 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '3', 'furnaces'); // электрическая 2х2 печь

    resultString = `${itemKey.padEnd(30)} : ${f2.toFixed(2).padEnd(20)} : ${f1.toFixed(2).padEnd(20)}`;
  } else if(itemProps.factorioType == 'chemicalFactories') {
    const f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '1', 'chemicalFactories'); // электрическая печь

    resultString = `${itemKey.padEnd(30)} : ${f1.toFixed(2).padEnd(20)}`;
  } else if(itemProps.factorioType == 'none') {
    resultString = `${itemKey.padEnd(30)} : этот ресурс не производится`;
  } else {
    const f1 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '1');
    const f2 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '2');
    const f3 = calculateOneItem(itemKey, bufferOfAllItems[itemKey], '3');

    resultString = `${itemKey.padEnd(30)} : ${f3.toFixed(2).padEnd(20)} : ${f2.toFixed(2).padEnd(20)} : ${f1.toFixed(2).padEnd(20)}`;
  }


  return resultString;
}

// Стартуем сессию чтения терминала
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

console.log(`Write Item Name; Count per minute [integer]`);
console.log(`Example: Железная шестеренка; 1500`);
console.log('================================================');
console.log('Type: list - to show list of items');
console.log('================================================');
rl.on('line', function(line){
  if (line == 'list') {
    console.log(allItemsNames);
  } else {
    const elements = line.split(';');
    const itemName = elements[0].trim();
    const count = parseInt(elements[1].trim());
    //const factorioName  = elements[2].trim();

    //const calculateResult = calculateOneItem(itemName, count, factorioName);

    bufferOfAllItems = {};
    createTreeOfItems(itemName, count);

    // console.log(bufferOfAllItems);
    const str0 = 'Название предмета';
    const str1 = 'Желтая 4х2 / Эл.печь';
    const str2 = 'Желтая / Ст. печь';
    const str3 = 'Синяя';
    console.log(`${str0.padEnd(30)} : ${str1.padEnd(20)} : ${str2.padEnd(20)} : ${str3.padEnd(20)}`)

    for(itemKey of Object.keys(bufferOfAllItems)) {
      console.log(createLine(itemKey));
    }
  }
})
