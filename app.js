const projectNameInput = document.getElementById('projectName');
const sheetCurrencySelect = document.getElementById('sheetCurrency');
const loadProjectBtn = document.getElementById('loadProject');
const saveProjectBtn = document.getElementById('saveProject');
const exportExcelBtn = document.getElementById('exportExcel');
const downloadJsonBtn = document.getElementById('downloadJson');
const importJsonInput = document.getElementById('importJson');
const importJsonBtn = document.getElementById('importJsonBtn');
const importExcelInput = document.getElementById('importExcel');
const importExcelBtn = document.getElementById('importExcelBtn');
const geminiQuery = document.getElementById('geminiSearchQuery');
const geminiApiKey = document.getElementById('geminiApiKey');
const geminiModelName = document.getElementById('geminiModelName');
const geminiSearchBtn = document.getElementById('geminiSearchButton');
const geminiResults = document.getElementById('geminiSearchResults');

const itemCategory = document.getElementById('itemCategory');
const addItemBtn = document.getElementById('addItem');
const cancelEditBtn = document.getElementById('cancelEdit');
const itemsBody = document.getElementById('itemsBody');
const grandTotal = document.getElementById('grandTotal');

const loadingOverlay = document.getElementById('loadingOverlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

let currentProjectName = 'defaultSheet';
let costingItems = [];
let currentSheetCurrency = 'USD';
let editingItemIndex = -1;

function showModal(title, body) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modal.classList.remove('hidden');
}
modalClose.addEventListener('click', () => modal.classList.add('hidden'));

function showLoading(show) {
  loadingOverlay.classList.toggle('hidden', !show);
}

function convertDuration(value, sourceUnit, targetUnit) {
  const dayFactor = { day: 1, week: 7, month: 30, year: 365 };
  return (Number(value) * (dayFactor[sourceUnit] || 1)) / (dayFactor[targetUnit] || 1);
}

function calculateAmount(item) {
  if (item.category === 'manpower') {
    const salary = Number(item.salaryRate || 0) * Number(item.duration || 0);
    const accDur = convertDuration(item.duration || 0, item.durationUnit || 'day', item.accommodationRateUnit || 'none');
    const accCostTotal = Number(item.accommodationRate || 0) * accDur;
    const accShared = item.accommodationSharedAmong > 0 ? item.accommodationSharedAmong : 1;
    const accCostPP = accCostTotal / accShared;

    const carDur = convertDuration(item.duration || 0, item.durationUnit || 'day', item.carRentalRateUnit || 'none');
    const carCostTotal = Number(item.carRentalRate || 0) * carDur;
    const carShared = item.carRentalSharedAmong > 0 ? item.carRentalSharedAmong : 1;
    const carCostPP = carCostTotal / carShared;

    const totalPerPerson = salary + accCostPP + carCostPP + Number(item.flights || 0) + Number(item.visa || 0);
    return totalPerPerson * Number(item.qty || 0);
  }
  return Number(item.qty || 0) * Number(item.rate || 0);
}

function renderTable() {
  itemsBody.innerHTML = '';
  let total = 0;
  costingItems.forEach((item, idx) => {
    const amount = calculateAmount(item);
    total += amount;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border p-2">${idx + 1}</td>
      <td class="border p-2">${item.category}</td>
      <td class="border p-2">${item.description || item.designation || ''}</td>
      <td class="border p-2">${item.qty || ''}</td>
      <td class="border p-2">${item.rate || item.salaryRate || ''}</td>
      <td class="border p-2">${item.unit || item.salaryUnit || ''}</td>
      <td class="border p-2">${item.duration || ''}</td>
      <td class="border p-2">${item.durationUnit || ''}</td>
      <td class="border p-2">${item.accommodationRate || 'N/A'}</td>
      <td class="border p-2">${item.accommodationRateUnit || 'N/A'}</td>
      <td class="border p-2">${item.accommodationType || 'N/A'}</td>
      <td class="border p-2">${item.accommodationSharedAmong || 'N/A'}</td>
      <td class="border p-2">${item.flights || 'N/A'}</td>
      <td class="border p-2">${item.carRentalRate || 'N/A'}</td>
      <td class="border p-2">${item.carRentalRateUnit || 'N/A'}</td>
      <td class="border p-2">${item.carRentalType || 'N/A'}</td>
      <td class="border p-2">${item.carRentalSharedAmong || 'N/A'}</td>
      <td class="border p-2">${item.visa || 'N/A'}</td>
      <td class="border p-2">${item.remarks || ''}</td>
      <td class="border p-2">${amount.toFixed(2)} ${currentSheetCurrency}</td>
      <td class="border p-2 text-right">
        <button data-idx="${idx}" class="edit text-blue-600 mr-2">Edit</button>
        <button data-idx="${idx}" class="delete text-red-600">Delete</button>
      </td>`;
    itemsBody.appendChild(tr);
  });
  grandTotal.textContent = `${total.toFixed(2)} ${currentSheetCurrency}`;
}

function saveToStorage() {
  const projects = JSON.parse(localStorage.getItem('projects') || '{}');
  projects[currentProjectName] = { items: costingItems, sheetCurrency: currentSheetCurrency };
  localStorage.setItem('projects', JSON.stringify(projects));
}

function loadFromStorage(name) {
  const projects = JSON.parse(localStorage.getItem('projects') || '{}');
  if (!projects[name]) {
    projects[name] = { items: [], sheetCurrency: 'USD' };
  }
  localStorage.setItem('projects', JSON.stringify(projects));
  currentProjectName = name;
  costingItems = projects[name].items;
  currentSheetCurrency = projects[name].sheetCurrency;
  projectNameInput.value = name;
  sheetCurrencySelect.value = currentSheetCurrency;
  renderTable();
}

function collectManpowerData() {
  return {
    designation: document.getElementById('manpowerDesignation').value,
    qty: document.getElementById('manpowerQty').value,
    salaryRate: document.getElementById('manpowerSalaryRate').value,
    salaryUnit: document.getElementById('manpowerSalaryUnit').value,
    duration: document.getElementById('manpowerDuration').value,
    durationUnit: document.getElementById('manpowerDurationUnit').value,
    accommodationRate: document.getElementById('manpowerAccommodationRate').value,
    accommodationRateUnit: document.getElementById('manpowerAccommodationRateUnit').value,
    accommodationType: document.getElementById('manpowerAccommodationType').value,
    accommodationSharedAmong: document.getElementById('manpowerAccommodationSharedAmong').value,
    flights: document.getElementById('manpowerFlights').value,
    carRentalRate: document.getElementById('manpowerCarRentalRate').value,
    carRentalRateUnit: document.getElementById('manpowerCarRentalRateUnit').value,
    carRentalType: document.getElementById('manpowerCarRentalType').value,
    carRentalSharedAmong: document.getElementById('manpowerCarRentalSharedAmong').value,
    visa: document.getElementById('manpowerVisa').value,
  };
}

function collectSimpleData(prefix) {
  return {
    description: document.getElementById(`${prefix}Description`).value,
    qty: document.getElementById(`${prefix}Quantity`).value,
    unit: document.getElementById(`${prefix}Unit`).value,
    rate: document.getElementById(`${prefix}Rate`).value,
  };
}

function clearForm() {
  document.querySelectorAll('#itemForm input').forEach(i => (i.value = ''));
  editingItemIndex = -1;
  addItemBtn.textContent = 'Add Item';
  cancelEditBtn.classList.add('hidden');
  showFields();
}

function addItem() {
  const category = itemCategory.value;
  let item = { category, remarks: document.getElementById('itemRemarks').value };
  if (category === 'manpower') item = { ...item, ...collectManpowerData() };
  else if (category === 'tools') item = { ...item, ...collectSimpleData('tools') };
  else if (category === 'equipment') item = { ...item, ...collectSimpleData('equipment') };
  else item = { ...item, ...collectSimpleData('other') };

  if (editingItemIndex > -1) {
    costingItems[editingItemIndex] = item;
  } else {
    costingItems.push(item);
  }
  saveToStorage();
  clearForm();
  renderTable();
}
addItemBtn.addEventListener('click', addItem);
cancelEditBtn.addEventListener('click', clearForm);

function handleTableClick(e) {
  const idx = Number(e.target.dataset.idx);
  if (e.target.classList.contains('delete')) {
    costingItems.splice(idx, 1);
    saveToStorage();
    renderTable();
  } else if (e.target.classList.contains('edit')) {
    editingItemIndex = idx;
    const item = costingItems[idx];
    itemCategory.value = item.category;
    showFields();
    if (item.category === 'manpower') {
      const keys = collectManpowerData();
      Object.keys(keys).forEach(k => {
        document.getElementById('manpower' + k.charAt(0).toUpperCase() + k.slice(1)).value = item[k] || '';
      });
    } else {
      const prefix = item.category === 'tools' ? 'tools' : item.category === 'equipment' ? 'equipment' : 'other';
      const keys = collectSimpleData(prefix);
      Object.keys(keys).forEach(k => {
        document.getElementById(prefix + k.charAt(0).toUpperCase() + k.slice(1)).value = item[k] || '';
      });
    }
    document.getElementById('itemRemarks').value = item.remarks || '';
    addItemBtn.textContent = 'Update Item';
    cancelEditBtn.classList.remove('hidden');
  }
}
itemsBody.addEventListener('click', handleTableClick);

function showFields() {
  document.getElementById('manpowerFields').classList.add('hidden');
  document.getElementById('toolsFields').classList.add('hidden');
  document.getElementById('equipmentFields').classList.add('hidden');
  document.getElementById('otherFields').classList.add('hidden');
  if (itemCategory.value === 'manpower') {
    document.getElementById('manpowerFields').classList.remove('hidden');
  } else if (itemCategory.value === 'tools') {
    document.getElementById('toolsFields').classList.remove('hidden');
  } else if (itemCategory.value === 'equipment') {
    document.getElementById('equipmentFields').classList.remove('hidden');
  } else {
    document.getElementById('otherFields').classList.remove('hidden');
  }
}
itemCategory.addEventListener('change', showFields);

function loadProject() {
  const name = projectNameInput.value || 'defaultSheet';
  loadFromStorage(name);
}
loadProjectBtn.addEventListener('click', loadProject);

sheetCurrencySelect.addEventListener('change', () => {
  currentSheetCurrency = sheetCurrencySelect.value;
  saveToStorage();
  renderTable();
});

saveProjectBtn.addEventListener('click', () => {
  saveToStorage();
  showModal('Saved', 'Project data saved to local storage.');
});

function exportJson() {
  const data = {
    projectName: currentProjectName,
    sheetCurrency: currentSheetCurrency,
    items: costingItems,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${currentProjectName}_CostingSheet_${currentSheetCurrency}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
downloadJsonBtn.addEventListener('click', exportJson);

importJsonBtn.addEventListener('click', () => importJsonInput.click());
importJsonInput.addEventListener('change', () => {
  const file = importJsonInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      currentProjectName = data.projectName || currentProjectName;
      projectNameInput.value = currentProjectName;
      currentSheetCurrency = data.sheetCurrency || currentSheetCurrency;
      sheetCurrencySelect.value = currentSheetCurrency;
      costingItems = costingItems.concat(data.items || []);
      saveToStorage();
      renderTable();
      showModal('Import', 'JSON import successful.');
    } catch (err) {
      showModal('Error', 'Failed to import JSON.');
    }
  };
  reader.readAsText(file);
  importJsonInput.value = '';
});

importExcelBtn.addEventListener('click', () => importExcelInput.click());
importExcelInput.addEventListener('change', () => {
  const file = importExcelInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      json.forEach(row => {
        const item = {
          category: row.Category || 'other',
          description: row.Description || row.Designation,
          designation: row.Designation || '',
          qty: row['Qty/Pers.'] || row.Quantity || '',
          rate: row.Rate || '',
          salaryRate: row['Salary Rate'] || '',
          salaryUnit: row['Salary Unit'] || '',
          unit: row.Unit || '',
          duration: row.Duration || '',
          durationUnit: row['Duration Unit'] || '',
          accommodationRate: row['Acc.Rate'] || '',
          accommodationRateUnit: row['Acc.Rate.U'] || '',
          accommodationType: row['Acc.Type'] || '',
          accommodationSharedAmong: row['Acc.Shared'] || '',
          flights: row.Flights || '',
          carRentalRate: row['Car.Rate'] || '',
          carRentalRateUnit: row['Car.Rate.U'] || '',
          carRentalType: row['Car.Type'] || '',
          carRentalSharedAmong: row['Car.Shared'] || '',
          visa: row.Visa || '',
          remarks: row.Remarks || '',
        };
        costingItems.push(item);
      });
      saveToStorage();
      renderTable();
      showModal('Import', 'Excel import successful.');
    } catch (err) {
      showModal('Error', 'Failed to import Excel.');
    }
  };
  reader.readAsBinaryString(file);
  importExcelInput.value = '';
});

function exportExcel() {
  const wsData = [];
  wsData.push([
    'Category','Desc/Design.','Qty/Pers.','Rate/Sal.','Unit/Sal.U.','MP Dur.','MP Dur.U.','Acc.Rate','Acc.Rate.U','Acc.Type','Acc.Shared','Flights','Car.Rate','Car.Rate.U','Car.Type','Car.Shared','Visa','Remarks','Amount'
  ]);
  costingItems.forEach(item => {
    wsData.push([
      item.category,
      item.description || item.designation || '',
      item.qty || '',
      item.rate || item.salaryRate || '',
      item.unit || item.salaryUnit || '',
      item.duration || '',
      item.durationUnit || '',
      item.accommodationRate || '',
      item.accommodationRateUnit || '',
      item.accommodationType || '',
      item.accommodationSharedAmong || '',
      item.flights || '',
      item.carRentalRate || '',
      item.carRentalRateUnit || '',
      item.carRentalType || '',
      item.carRentalSharedAmong || '',
      item.visa || '',
      item.remarks || '',
      calculateAmount(item).toFixed(2),
    ]);
  });
  wsData.push([]);
  wsData.push(['Grand Total', grandTotal.textContent]);
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cost Sheet');
  XLSX.writeFile(wb, `${currentProjectName}_Categorized_Costs_${currentSheetCurrency}.xlsx`);
}
exportExcelBtn.addEventListener('click', exportExcel);

function performGeminiSearch() {
  const key = geminiApiKey.value;
  const model = geminiModelName.value || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const prompt = `Currency: ${currentSheetCurrency}\nItems:\n${JSON.stringify(costingItems, null, 2)}\nQuery: ${geminiQuery.value}`;
  showLoading(true);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  })
    .then(r => r.json())
    .then(res => {
      geminiResults.textContent = res.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    })
    .catch(() => {
      geminiResults.textContent = 'Error calling Gemini API';
    })
    .finally(() => showLoading(false));
}

geminiSearchBtn.addEventListener('click', performGeminiSearch);

// Initial load
loadFromStorage(currentProjectName);
