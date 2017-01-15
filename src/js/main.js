{

  const dataEndpointURI = 'http://localhost:3091/api/data/import';

  function main() {
    attachExportButtonToDOM();
    addCSSRules();
  }

  function attachExportButtonToDOM() {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.documentElement.style.width = '100%';
    document.body.style.width = '100%';

    var changeReport = document.getElementsByClassName('change-report')[0];

    var div = document.createElement('div');

    changeReport.appendChild(div);

    div.align = 'right';

    var btn = document.createElement('a');

    div.appendChild(btn);

    btn.classList.add('btn');
    btn.classList.add('btn-primary');
    btn.innerHTML = 'Export Data';
    btn.onclick = scrapeData;
  }

  function addCSSRules() {
    let sheet = (function() {
      let style = document.createElement('style');
      style.appendChild(document.createTextNode(''));
      document.head.appendChild(style);

      return style.sheet;
    })();

    function addCSSRule(sheet, selector, rules, index) {
      if ('insertRule' in sheet) {
        sheet.insertRule(selector + '{' + rules + '}', index);
      } else if ('addRule' in sheet) {
        sheet.addRule(selector, rules, index);
      }
    }

    addCSSRule(sheet, '.btn', `display: inline-block;
      margin-bottom: 0px;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.42857;
      text-align: center;
      white-space: nowrap;
      vertical-align: middle;
      touch-action: manipulation;
      cursor: pointer;
      user-select: none;
      background-image: none;
      padding: 6px 12px;
      border-width: 1px;
      border-style: solid;
      border-color: transparent;
      border-image: initial;
      border-radius: 4px;`)

    addCSSRule(sheet, '.btn-primary', `color: rgb(255, 255, 255);
      background-color: rgb(51, 122, 183);
      border-color: rgb(46, 109, 164)`);

    addCSSRule(sheet, '.btn-primary:hover', `color: rgb(255, 255, 255) !important;
      background-color: rgb(40, 96, 144);
      border-color: rgb(32, 77, 116);`)

  }

  function parseTable(table) {
    var rows = [].slice.call(table.rows);
    var headerRow = rows.shift();
    var footerRow = rows.pop();
    var items = {};
    var itemTemplate = new Map();

    for (let i = 1; i < headerRow.cells.length; i++) {
      let cell = headerRow.cells[i];
      itemTemplate.set((i - 1), cell.innerHTML);
    }

    let itemName = null;

    for (let i = 0; i < rows.length; i++) {
      if (rows[i].className === 'title') {
        itemName = rows[i].cells[0].innerHTML;
        items[itemName] = {};
      } else {
        let rowName = rows[i].cells[0].innerHTML;
        if (items[itemName][rowName]) {
          let maxCount = 0;
          for (let k in items[itemName]) {
            k.includes(rowName) ? maxCount++ : null;
          }
          rowName += ` (${maxCount + 1})`;
        }
        items[itemName][rowName] = {};
        for (let j = 1; j < rows[i].cells.length; j++) {
          items[itemName][rowName][itemTemplate.get(j - 1)] = rows[i].cells[j].innerHTML;
        }
      }

    }

    return items;
  }

  function parseNotes(element, notes) {
    if (!notes) {
      notes = {};
    }
    if (element.nodeName === 'P') {
      notes[element.previousElementSibling.innerHTML] = element.innerHTML;
    }

    return notes;
  }

  function parseData(elementArray) {
    var days = [];
    var day = {};
    for (let i = 0; i < elementArray.length; i++) {
      var e = elementArray[i];
      if (!e) {
        return;
      }
      var isNewDay = e.className === 'main-title-2';
      if (isNewDay) {
        i !== 0 ? days.push(day) : null;
        day = {
          date: e.innerHTML
        }
      } else if (e.id === 'food') {
        day.meals = parseTable(e);
      } else if (e.id === 'excercise') {
        day.excercises = parseTable(e);
      } else if (e.className === 'notes') {
        day.notes = parseNotes(e, day.notes);
      }
      if (i === (elementArray.length - 1)) {
        days.push(day);
      }
    }
    console.log(days);
    exportData(days);
  }

  function exportData(data) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', dataEndpointURI);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  }

  function scrapeData() {
    var content = document.getElementById('content');
    var children = [].slice.call(content.children);
    if (children[0].classList.contains('change-report')) {
      children.splice(0, 1);
    }
    parseData(children);
  }

  main();

}
