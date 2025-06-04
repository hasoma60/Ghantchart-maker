const items = JSON.parse(localStorage.getItem('costItems') || '[]');
let editingIndex = -1;

const itemCategory = document.getElementById('itemCategory');
const addItemBtn = document.getElementById('addItem');
const itemsBody = document.getElementById('itemsBody');
const grandTotal = document.getElementById('grandTotal');

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

function calculateAmount(item) {
  if (item.category === 'manpower') {
    return (Number(item.salaryRate || 0) * Number(item.duration || 0)) * Number(item.qty || 0);
  } else {
    return Number(item.qty || 0) * Number(item.rate || 0);
  }
}

function clearForm() {
  document.querySelectorAll('#itemForm input').forEach(i => i.value = '');
  editingIndex = -1;
  addItemBtn.textContent = 'Add Item';
}

function saveItems() {
  localStorage.setItem('costItems', JSON.stringify(items));
  renderTable();
}

function addItem() {
  const category = itemCategory.value;
  const item = { category };
  if (category === 'manpower') {
    item.designation = document.getElementById('manpowerDesignation').value;
    item.qty = document.getElementById('manpowerQty').value;
    item.salaryRate = document.getElementById('manpowerSalaryRate').value;
    item.duration = document.getElementById('manpowerDuration').value;
  } else if (category === 'tools') {
    item.description = document.getElementById('toolsDescription').value;
    item.qty = document.getElementById('toolsQuantity').value;
    item.rate = document.getElementById('toolsRate').value;
  } else if (category === 'equipment') {
    item.description = document.getElementById('equipmentDescription').value;
    item.qty = document.getElementById('equipmentQuantity').value;
    item.rate = document.getElementById('equipmentRate').value;
  } else {
    item.description = document.getElementById('otherDescription').value;
    item.qty = document.getElementById('otherQuantity').value;
    item.rate = document.getElementById('otherRate').value;
  }
  item.amount = calculateAmount(item);
  if (editingIndex > -1) {
    items[editingIndex] = item;
  } else {
    items.push(item);
  }
  saveItems();
  clearForm();
}

addItemBtn.addEventListener('click', addItem);

function renderTable() {
  itemsBody.innerHTML = '';
  let total = 0;
  items.forEach((item, idx) => {
    const tr = document.createElement('tr');
    const amount = calculateAmount(item);
    total += amount;
    tr.innerHTML = `
      <td class="border p-2">${idx + 1}</td>
      <td class="border p-2">${item.category}</td>
      <td class="border p-2">${item.description || item.designation || ''}</td>
      <td class="border p-2">${item.qty || ''}</td>
      <td class="border p-2">${item.rate || item.salaryRate || ''}</td>
      <td class="border p-2">${amount.toFixed(2)}</td>
      <td class="border p-2 text-right"><button data-idx="${idx}" class="edit text-blue-600 mr-2">Edit</button><button data-idx="${idx}" class="delete text-red-600">Delete</button></td>
    `;
    itemsBody.appendChild(tr);
  });
  grandTotal.textContent = total.toFixed(2);
}

itemsBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete')) {
    const idx = Number(e.target.dataset.idx);
    items.splice(idx, 1);
    saveItems();
  } else if (e.target.classList.contains('edit')) {
    const idx = Number(e.target.dataset.idx);
    const item = items[idx];
    editingIndex = idx;
    itemCategory.value = item.category;
    showFields();
    if (item.category === 'manpower') {
      document.getElementById('manpowerDesignation').value = item.designation || '';
      document.getElementById('manpowerQty').value = item.qty || '';
      document.getElementById('manpowerSalaryRate').value = item.salaryRate || '';
      document.getElementById('manpowerDuration').value = item.duration || '';
    } else if (item.category === 'tools') {
      document.getElementById('toolsDescription').value = item.description || '';
      document.getElementById('toolsQuantity').value = item.qty || '';
      document.getElementById('toolsRate').value = item.rate || '';
    } else if (item.category === 'equipment') {
      document.getElementById('equipmentDescription').value = item.description || '';
      document.getElementById('equipmentQuantity').value = item.qty || '';
      document.getElementById('equipmentRate').value = item.rate || '';
    } else {
      document.getElementById('otherDescription').value = item.description || '';
      document.getElementById('otherQuantity').value = item.qty || '';
      document.getElementById('otherRate').value = item.rate || '';
    }
    addItemBtn.textContent = 'Update Item';
  }
});

function downloadJson() {
  const data = {
    projectName: document.getElementById('projectName').value || 'default',
    sheetCurrency: document.getElementById('sheetCurrency').value,
    items,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.projectName}_CostingSheet_${data.sheetCurrency}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('downloadJson').addEventListener('click', downloadJson);

showFields();
renderTable();
