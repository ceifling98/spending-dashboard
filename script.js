let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

const form = document.getElementById("expenseForm");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const totalDisplay = document.getElementById("total");
const resetBtn = document.getElementById("resetBtn");
const entryTable = document.getElementById("entryTable").querySelector("tbody");
const categoryFilter = document.getElementById("categoryFilter");
const monthFilter = document.getElementById("monthFilter");
const exportBtn = document.getElementById("exportBtn");

let chart;

// Event: Submit new expense
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const category = categoryInput.value.trim();
  const amount = parseFloat(amountInput.value);

  if (!category || isNaN(amount) || amount <= 0) return;

  expenses.push({
    category,
    amount,
    date: new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  });

  categoryInput.value = "";
  amountInput.value = "";
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateDashboard();
});

// Event: Reset/delete all
resetBtn.addEventListener("click", () => {
  if (confirm("Delete all expenses?")) {
    expenses = [];
    localStorage.removeItem("expenses");
    updateDashboard();
  }
});

// Event: Export to CSV
exportBtn.addEventListener("click", () => {
  const rows = [["Category", "Amount", "Date"]];
  expenses.forEach(e => {
    rows.push([e.category, e.amount, e.date]);
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
});

// Update dashboard
function updateDashboard() {
  // Update filter dropdowns
  categoryFilter.innerHTML = '<option value="">All Categories</option>';
  [...new Set(expenses.map(e => e.category))].forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Apply filters
  const selectedCategory = categoryFilter.value;
  const selectedMonth = monthFilter.value;

  const filteredExpenses = expenses.filter(e => {
    const matchesCategory = selectedCategory ? e.category === selectedCategory : true;
    const matchesMonth = selectedMonth ? e.date.slice(0, 7) === selectedMonth : true;
    return matchesCategory && matchesMonth;
  });

  // Update total
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  totalDisplay.textContent = `Total Spent: $${total.toFixed(2)}`;

  // Group by category
  const summary = {};
  filteredExpenses.forEach(e => {
    summary[e.category] = (summary[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(summary);
  const data = Object.values(summary);

  // Draw chart
  const ctx = document.getElementById("spendingChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        label: "Spending",
        data,
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
          "#FF9F40", "#C9CBCF"
        ]
      }]
    }
  });

  // Table entries
  entryTable.innerHTML = "";
  filteredExpenses.slice().reverse().forEach((e, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${e.category}</td>
      <td>$${e.amount.toFixed(2)}</td>
      <td>${e.date}</td>
      <td>
        <button onclick="editEntry(${index})">Edit</button>
        <button onclick="deleteEntry(${index})">Delete</button>
      </td>
    `;
    entryTable.appendChild(row);
  });
}

// Edit an entry
function editEntry(index) {
  const realIndex = expenses.length - 1 - index; // because we reverse the array
  const item = expenses[realIndex];
  const newCategory = prompt("Edit category:", item.category);
  const newAmount = prompt("Edit amount:", item.amount);

  if (newCategory && !isNaN(parseFloat(newAmount))) {
    item.category = newCategory.trim();
    item.amount = parseFloat(newAmount);
    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateDashboard();
  }
}

// Delete an entry
function deleteEntry(index) {
  const realIndex = expenses.length - 1 - index;
  expenses.splice(realIndex, 1);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateDashboard();
}

// Update on filter change
categoryFilter.addEventListener("change", updateDashboard);
monthFilter.addEventListener("change", updateDashboard);

// Initial load
updateDashboard();

  

