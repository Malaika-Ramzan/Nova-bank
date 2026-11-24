
/* =========================================
   NOVA BANK
   Digital Banking Application
   JavaScript Functionality
========================================= */

"use strict";

/* =========================================
   1. SELECT ELEMENTS AND DEMO DATA
========================================= */

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "nova_bank_demo_data";

const defaultData = {
    balance: 248500,

    transactions: [
        {
            title: "Monthly Salary",
            category: "Income",
            date: "24 Nov 2026",
            amount: 85000,
            type: "income"
        },
        {
            title: "Grocery Shopping",
            category: "Shopping",
            date: "22 Nov 2026",
            amount: 8500,
            type: "expense"
        },
        {
            title: "Internet Bill",
            category: "Bills",
            date: "20 Nov 2026",
            amount: 2500,
            type: "expense"
        },
        {
            title: "Freelance Payment",
            category: "Income",
            date: "18 Nov 2026",
            amount: 12000,
            type: "income"
        },
        {
            title: "Transport",
            category: "Transport",
            date: "16 Nov 2026",
            amount: 1800,
            type: "expense"
        },
        {
            title: "Education Fee",
            category: "Education",
            date: "14 Nov 2026",
            amount: 12000,
            type: "expense"
        }
    ],

    budgets: [
        { category: "Food", limit: 15000, spent: 8500 },
        { category: "Shopping", limit: 12000, spent: 7000 },
        { category: "Transport", limit: 8000, spent: 4500 },
        { category: "Education", limit: 20000, spent: 12000 }
    ],

    goals: [
        { name: "New Laptop", target: 150000, saved: 75000 },
        { name: "Emergency Fund", target: 100000, saved: 65000 }
    ],

    cardLocked: false,

    profile: {
        name: "Demo User",
        email: "demo@example.com"
    },

    notifications: [
        "Welcome to NOVA BANK!",
        "Your demo account is ready.",
        "Explore your financial dashboard."
    ]
};

/* =========================================
   2. LOAD AND SAVE DATA
========================================= */

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return JSON.parse(JSON.stringify(defaultData));
        }

        const parsed = JSON.parse(saved);

        if (
            typeof parsed.balance !== "number" ||
            !Array.isArray(parsed.transactions) ||
            !Array.isArray(parsed.budgets) ||
            !Array.isArray(parsed.goals)
        ) {
            return JSON.parse(JSON.stringify(defaultData));
        }

        return {
            ...JSON.parse(JSON.stringify(defaultData)),
            ...parsed
        };

    } catch (error) {
        console.error("Could not load saved data:", error);
        return JSON.parse(JSON.stringify(defaultData));
    }
}

let data = loadData();

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        showToast("Unable to save data in this browser.");
    }
}

/* =========================================
   3. HELPER FUNCTIONS
========================================= */

function money(amount) {
    return "Rs. " + Number(amount).toLocaleString("en-PK", {
        maximumFractionDigits: 2
    });
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return replacements[character];
    });
}

function today() {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date());
}

function validAmount(value) {
    return Number.isFinite(value) && value > 0;
}

/* =========================================
   4. TOAST NOTIFICATIONS
========================================= */

let toastTimer;

function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

/* =========================================
   5. PAGE NAVIGATION
========================================= */

function navigateTo(pageName) {
    const page = $(pageName);

    if (!page || !page.classList.contains("page")) {
        return;
    }

    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    page.classList.add("active");

    document.querySelectorAll(".nav-link[data-page]").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    const activeButton = document.querySelector(
        `.nav-link[data-page="${pageName}"]`
    );

    $("pageTitle").textContent = activeButton
        ? activeButton.textContent.trim()
        : "Dashboard";

    $("sidebar").classList.remove("open");

    if (pageName === "transactions") renderTransactions();
    if (pageName === "budgets") renderBudgets();
    if (pageName === "savings") renderGoals();
    if (pageName === "cards") renderCard();
    if (pageName === "profile") renderProfile();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        navigateTo(button.dataset.page);
    });
});

document.querySelectorAll("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        navigateTo(button.dataset.go);
    });
});

/* MOBILE SIDEBAR */

$("menuToggle").addEventListener("click", () => {
    $("sidebar").classList.toggle("open");
});

/* =========================================
   6. BALANCE HIDE AND SHOW
========================================= */

let balanceVisible = true;

function renderBalance() {
    $("balance").textContent = balanceVisible
        ? money(data.balance)
        : "••••••••";

    $("transferBalance").textContent = money(data.balance);
}

$("toggleBalance").addEventListener("click", () => {
    balanceVisible = !balanceVisible;

    renderBalance();
});

/* =========================================
   7. TRANSACTION MANAGEMENT
========================================= */

function addTransaction(title, category, amount, type) {
    data.transactions.unshift({
        title: title,
        category: category,
        date: today(),
        amount: amount,
        type: type
    });

    saveData();

    renderTransactions();
    renderRecentTransactions();
    updateStatistics();
}

function transactionHTML(transaction) {
    const isIncome = transaction.type === "income";

    return `
        <tr>
            <td>
                <strong>${escapeHTML(transaction.title)}</strong>
            </td>

            <td>${escapeHTML(transaction.date)}</td>

            <td>${escapeHTML(transaction.category)}</td>

            <td class="${isIncome ? "amount-plus" : "amount-minus"}">
                ${isIncome ? "+" : "-"}${money(transaction.amount)}
            </td>

            <td>
                <span class="status">Completed</span>
            </td>
        </tr>
    `;
}

function renderRecentTransactions() {
    const recent = data.transactions.slice(0, 5);

    $("recentRows").innerHTML = recent.length
        ? recent.map(transactionHTML).join("")
        : `<tr><td colspan="5" class="empty-row">No transactions available.</td></tr>`;
}

function renderTransactions() {
    const search = $("transactionSearch").value.trim().toLowerCase();
    const filter = $("transactionFilter").value;

    const filtered = data.transactions.filter(transaction => {
        const matchesSearch =
            transaction.title.toLowerCase().includes(search) ||
            transaction.category.toLowerCase().includes(search);

        const matchesFilter =
            filter === "all" || transaction.type === filter;

        return matchesSearch && matchesFilter;
    });

    $("transactionRows").innerHTML = filtered.length
        ? filtered.map(transactionHTML).join("")
        : `<tr><td colspan="5" class="empty-row">No matching transactions found.</td></tr>`;
}

$("transactionSearch").addEventListener("input", renderTransactions);

$("transactionFilter").addEventListener("change", renderTransactions);

/* =========================================
   8. DASHBOARD STATISTICS
========================================= */

function updateStatistics() {
    const income = data.transactions
        .filter(item => item.type === "income")
        .reduce((total, item) => total + item.amount, 0);

    const expenses = data.transactions
        .filter(item => item.type === "expense")
        .reduce((total, item) => total + item.amount, 0);

    $("incomeTotal").textContent = money(income);
    $("expenseTotal").textContent = money(expenses);
    $("netTotal").textContent = money(data.balance);
}

/* =========================================
   9. CONFIRMATION MODAL
========================================= */

let pendingAction = null;

function showModal(title, details, action) {
    $("modalTitle").textContent = title;

    $("modalBody").innerHTML = `
        <div class="modal-details">
            ${details.map(item => `
                <div class="modal-detail">
                    <span>${escapeHTML(item.label)}</span>
                    <strong>${escapeHTML(item.value)}</strong>
                </div>
            `).join("")}
        </div>
    `;

    $("modalButtons").innerHTML = `
        <button class="secondary-btn" id="cancelModal">
            Cancel
        </button>

        <button class="primary-btn" id="confirmModal">
            Confirm
        </button>
    `;

    pendingAction = action;

    $("modal").classList.add("show");

    $("cancelModal").addEventListener("click", closeModal);

    $("confirmModal").addEventListener("click", () => {
        const actionToRun = pendingAction;

        closeModal();

        if (actionToRun) {
            actionToRun();
        }
    });
}

function closeModal() {
    $("modal").classList.remove("show");
    pendingAction = null;
}

$("modalClose").addEventListener("click", closeModal);

$("modal").addEventListener("click", event => {
    if (event.target === $("modal")) {
        closeModal();
    }
});

/* =========================================
   10. MONEY TRANSFER
========================================= */

$("transferForm").addEventListener("submit", event => {
    event.preventDefault();

    const recipient = $("recipient").value.trim();
    const account = $("accountNumber").value.trim();
    const amount = Number($("transferAmount").value);
    const note = $("transferNote").value.trim();

    if (!recipient || !account || !validAmount(amount)) {
        showToast("Please enter valid transfer details.");
        return;
    }

    if (amount > data.balance) {
        showToast("Insufficient demo account balance!");
        return;
    }

    showModal(
        "Review Your Transfer",
        [
            { label: "Recipient", value: recipient },
            { label: "Account Reference", value: account },
            { label: "Transfer Amount", value: money(amount) },
            { label: "Description", value: note || "No description" },
            { label: "Transaction Type", value: "Demo Transfer" }
        ],
        () => {
            data.balance -= amount;

            addTransaction(
                "Transfer to " + recipient,
                "Transfer",
                amount,
                "expense"
            );

            renderBalance();

            $("transferForm").reset();

            showToast("Demo transfer completed successfully!");
        }
    );
});

/* =========================================
   11. UTILITY BILL PAYMENTS
========================================= */

$("billForm").addEventListener("submit", event => {
    event.preventDefault();

    const type = $("billType").value;
    const reference = $("consumerNumber").value.trim();
    const amount = Number($("billAmount").value);

    if (!type || !reference || !validAmount(amount)) {
        showToast("Please enter valid bill details.");
        return;
    }

    if (amount > data.balance) {
        showToast("Insufficient demo account balance!");
        return;
    }

    showModal(
        "Review Bill Payment",
        [
            { label: "Bill Category", value: type },
            { label: "Reference Number", value: reference },
            { label: "Payment Amount", value: money(amount) },
            { label: "Payment Mode", value: "Demo Simulation" }
        ],
        () => {
            data.balance -= amount;

            addTransaction(
                type + " Bill Payment",
                "Bills",
                amount,
                "expense"
            );

            renderBalance();

            $("billForm").reset();

            showToast("Demo bill payment completed!");
        }
    );
});

/* =========================================
   12. BUDGET PLANNER
========================================= */

$("budgetForm").addEventListener("submit", event => {
    event.preventDefault();

    const category = $("budgetCategory").value;
    const limit = Number($("budgetLimit").value);
    const spent = Number($("budgetSpent").value);

    if (
        !category ||
        !validAmount(limit) ||
        !Number.isFinite(spent) ||
        spent < 0
    ) {
        showToast("Please enter valid budget information.");
        return;
    }

    const existingBudget = data.budgets.find(
        budget => budget.category === category
    );

    if (existingBudget) {
        existingBudget.limit = limit;
        existingBudget.spent = spent;
    } else {
        data.budgets.push({
            category,
            limit,
            spent
        });
    }

    saveData();

    renderBudgets();

    $("budgetForm").reset();

    showToast("Monthly budget saved successfully!");
});

function renderBudgets() {
    $("budgetList").innerHTML = data.budgets.map(budget => {
        const percentage = (budget.spent / budget.limit) * 100;

        const visualPercentage = Math.min(percentage, 100);

        return `
            <div class="budget-card">

                <h3>${escapeHTML(budget.category)}</h3>

                <div class="budget-meta">
                    <span>Amount Spent: ${money(budget.spent)}</span>
                    <strong>${Math.round(percentage)}%</strong>
                </div>

                <div class="progress-track">
                    <div
                        class="progress-fill ${percentage > 100 ? "over" : ""}"
                        style="width: ${visualPercentage}%">
                    </div>
                </div>

                <div class="budget-meta">
                    <span>Monthly Limit</span>
                    <strong>${money(budget.limit)}</strong>
                </div>

                <small class="${percentage > 100 ? "negative" : "positive"}">
                    ${percentage > 100
                        ? "Budget exceeded!"
                        : "Within budget"}
                </small>

            </div>
        `;
    }).join("");
}

/* =========================================
   13. SAVINGS GOALS
========================================= */

$("goalForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("goalName").value.trim();
    const target = Number($("goalTarget").value);
    const saved = Number($("goalSaved").value);

    if (
        !name ||
        !validAmount(target) ||
        !Number.isFinite(saved) ||
        saved < 0
    ) {
        showToast("Please enter valid savings goal details.");
        return;
    }

    data.goals.push({
        name,
        target,
        saved
    });

    saveData();

    renderGoals();

    $("goalForm").reset();

    showToast("Your new savings goal has been created!");
});

function renderGoals() {
    $("goalList").innerHTML = data.goals.map(goal => {
        const percentage = (goal.saved / goal.target) * 100;

        const visualPercentage = Math.min(percentage, 100);

        const remaining = Math.max(0, goal.target - goal.saved);

        return `
            <div class="goal-card">

                <div class="goal-symbol">◎</div>

                <h3>${escapeHTML(goal.name)}</h3>

                <div class="budget-meta">
                    <span>Saved: ${money(goal.saved)}</span>
                    <strong>${Math.round(percentage)}%</strong>
                </div>

                <div class="progress-track">
                    <div
                        class="progress-fill"
                        style="width: ${visualPercentage}%">
                    </div>
                </div>

                <div class="budget-meta">
                    <span>Target Amount</span>
                    <strong>${money(goal.target)}</strong>
                </div>

                <small class="positive">
                    ${percentage >= 100
                        ? "Congratulations! Goal achieved."
                        : money(remaining) + " remaining"}
                </small>

            </div>
        `;
    }).join("");
}

/* =========================================
   14. DEBIT CARD MANAGEMENT
========================================= */

function renderCard() {
    $("cardStatus").textContent = data.cardLocked
        ? "Locked"
        : "Active";

    $("cardToggle").textContent = data.cardLocked
        ? "Unlock Demo Card"
        : "Lock Demo Card";

    $("bankCard").classList.toggle(
        "locked",
        data.cardLocked
    );
}

$("cardToggle").addEventListener("click", () => {
    data.cardLocked = !data.cardLocked;

    saveData();

    renderCard();

    showToast(
        data.cardLocked
            ? "Your demo card is now locked."
            : "Your demo card is now unlocked."
    );
});

/* =========================================
   15. PROFILE MANAGEMENT
========================================= */

function renderProfile() {
    $("profileName").value = data.profile.name;
    $("profileEmail").value = data.profile.email;
}

function updateUserName() {
    const name = data.profile.name;

    $("headerName").textContent = name;
    $("welcomeName").textContent = name;
    $("heroName").textContent = name.toUpperCase();
    $("cardHolder").textContent = name.toUpperCase();
}

$("profileForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("profileName").value.trim();
    const email = $("profileEmail").value.trim();

    if (!name || !email) {
        showToast("Please complete your profile information.");
        return;
    }

    data.profile = {
        name,
        email
    };

    saveData();

    updateUserName();

    showToast("Your demo profile has been updated!");
});

/* =========================================
   16. NOTIFICATIONS
========================================= */

$("notificationBtn").addEventListener("click", () => {
    if (data.notifications.length === 0) {
        showModal(
            "All Caught Up!",
            [
                {
                    label: "Notifications",
                    value: "No new notifications."
                }
            ],
            closeModal
        );

        return;
    }

    showModal(
        "Your Notifications",
        data.notifications.map((message, index) => ({
            label: "Notification " + (index + 1),
            value: message
        })),
        () => {
            data.notifications = [];

            saveData();

            showToast("Notifications cleared.");
        }
    );
});

/* =========================================
   17. HELP CENTER
========================================= */

$("helpBtn").addEventListener("click", () => {
    showModal(
        "NOVA BANK Help Center",
        [
            {
                label: "Dashboard",
                value: "View your account overview."
            },
            {
                label: "Transfers",
                value: "Practice demo money transfers."
            },
            {
                label: "Transactions",
                value: "Search account activities."
            },
            {
                label: "Budgets",
                value: "Manage monthly spending."
            },
            {
                label: "Savings",
                value: "Monitor financial goals."
            }
        ],
        closeModal
    );

    $("modalButtons").innerHTML = `
        <button class="primary-btn" id="helpClose">
            Got It!
        </button>
    `;

    $("helpClose").addEventListener("click", closeModal);
});

/* =========================================
   18. INITIALIZE APPLICATION
========================================= */

function initializeApp() {
    updateUserName();

    renderBalance();

    renderRecentTransactions();

    renderTransactions();

    renderBudgets();

    renderGoals();

    renderCard();

    renderProfile();

    updateStatistics();

    console.log("NOVA BANK initialized successfully.");
}

initializeApp();
